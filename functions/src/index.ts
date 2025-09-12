

// FIX: The default import for 'firebase-functions' resolves to the v2 SDK,
// but this function uses v1 features (e.g., `functions.config()`, `request.body`).
// Explicitly import from 'firebase-functions/v1' to use the correct types and runtime.
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
// FIX: Explicitly import Request and Response from 'express' to avoid conflicts with global types and ensure
// the correct types for the v1 onRequest handler, which uses Express-style objects.
import { Request, Response } from "express";
import { GoogleGenAI, Part, Content, Tool, FunctionDeclaration, Type, GroundingChunk } from "@google/genai";
import { ChatMessage, Attachment, Source, MindMapNode, CalendarEventData } from "./types";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Initialize Gemini AI
// The API_KEY is set in the Firebase Function's runtime environment variables
// This is now configured in the Google Cloud Console UI.
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("FATAL ERROR: Gemini API Key not found in function configuration.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY! });


// --- Replicated from Frontend ---
const systemInstruction = `You are "Dude," a personal AI assistant for Asha.
Your personality is friendly, encouraging, and action-oriented. You're a super-capable and supportive best friend, always ready to help with a positive attitude.

---
**PRIMARY GOAL: Be Asha's holistic AI partner, supporting her career goals, her business ('olir'), and her personal well-being.**
All your functions and responses should, where possible, align with this balanced objective.
---

[Asha's Resume Summary - FOR YOUR CONTEXT]
- **Role:** Versatile Product, Program, and Project Manager with 9+ years of experience.
- **Industries:** Automotive, AI, Energy, Manufacturing.
- **Key Achievements:**
  - Led end-to-end delivery of Gen3 Driver Monitoring System ($10M portfolio) at SEEING MACHINES.
  - Developed and led a 5-year product strategy for HVDC systems at HITACHI ENERGY, increasing revenue by 40%.
  - Delivered 80$/unit savings at CATERPILLAR with a new damper guard design.
  - Drove cross-functional collaboration with teams of 40+ members.
- **Certifications:** PMP, Prince2, Certified Scrum Product Owner.
- **Skills:** Product Lifecycle Management (PLM), Agile/Scrum, Go-To-Market Strategy, Stakeholder Engagement, Roadmap Development, Data-Driven Decision Making (Power BI).
- **Technical:** Jira, PowerBI, Primavera, MS Project, Teamcenter, Windchill, Solidworks, CATIA.
- **Status:** Australian Permanent Resident.
---

Your Core Directives:

1.  **Be Asha's Career Strategist:**
    - Help her land a Program/Project Manager job in Australia.
    - Use your built-in tools (\`tailorResumeForJob\`, \`generateCoverLetter\`, etc.) to make her applications stand out.
    - Proactively suggest strategies for networking and job searching.

2.  **Be Asha's Business Partner for 'olir':**
    - 'olir' is her cosmetics brand. Help her with brainstorming, marketing ideas, and product visualization.
    - Use your tools like \`generateProductMockup\` to bring her ideas to life.
    - Assist with summarizing market research or drafting business communications.

3.  **Be Asha's Wellness Champion & Friend:**
    - Her mental health is your top priority. Be a non-judgmental, supportive friend she can talk to.
    - Proactively check in on her. If she mentions feeling stressed, tired, or overwhelmed, suggest a mindfulness break or a guided breathing exercise.
    - Encourage a healthy work-life balance. Remind her it's okay to step away and recharge.
    - Offer to create mind maps for learning or organizing thoughts to reduce cognitive load.
    - Maintain a consistently positive, empathetic, and encouraging tone.

4.  **Use Your Tools Proactively & transparently:**
    - When you use a tool, tell Asha what you're doing (e.g., "Okay, I'll draft that cover letter for you..." or "I'm searching for some recent market data on that...").
    - If a task is complex, give her a quick update on your progress.
    - You have Google Search enabled. Use it for recent events, news, or up-to-date information. ALWAYS cite your sources from the web.`;

const functionDeclarations: FunctionDeclaration[] = [
    {
        name: 'createMindMap',
        description: 'Creates a hierarchical mind map from a given topic or structured data. Useful for brainstorming, learning, and organizing thoughts.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: 'The central topic or root of the mind map.' },
                children: {
                    type: Type.ARRAY,
                    description: 'An array of child nodes, which can themselves have children.',
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            children: {
                                type: Type.ARRAY,
                                description: 'Nested child nodes.',
                                items: {
                                    type: Type.OBJECT, 
                                }
                            }
                        },
                        required: ['title']
                    }
                }
            },
            required: ['title']
        }
    },
    {
        name: 'scheduleEvent',
        description: 'Schedules a calendar event for Asha.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: 'The title of the event.' },
                startTime: { type: Type.STRING, description: 'The start time in ISO 8601 format.' },
                duration: { type: Type.INTEGER, description: 'The duration of the event in minutes.' }
            },
            required: ['title', 'startTime', 'duration']
        }
    },
];

const tools: Tool[] = [
    { functionDeclarations: functionDeclarations },
    { googleSearch: {} }
];

const buildHistory = (history: ChatMessage[]): Content[] => {
    const geminiHistory: Content[] = [];
    for (const message of history) {
        if (message.id === 'initial-message') continue;

        const parts: Part[] = [];
        if (message.attachments) {
            for (const att of message.attachments) {
                parts.push({ inlineData: { mimeType: att.mimeType, data: att.data } });
            }
        }
        if(message.text) {
             parts.push({ text: message.text });
        }

        geminiHistory.push({
            role: message.sender === 'user' ? 'user' : 'model',
            parts: parts,
        });
    }
    return geminiHistory;
};

// Main API function to handle all requests
// FIX: Use `Request` and `Response` from express to ensure correct typing and avoid conflicts.
export const api = functions.https.onRequest(async (request: Request, response: Response) => {
    // Enable CORS for all origins
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    
    if (request.method === "OPTIONS") {
        response.status(204).send();
        return;
    }

    if (!API_KEY) {
        response.status(500).send("API Key not configured.");
        return;
    }

    const path = request.path.split("/api/")[1];

    try {
        switch (path) {
            case "generateContent":
                await handleGenerateContent(request, response);
                break;
            case "generateTitle":
                await handleGenerateTitle(request, response);
                break;
            case "generateAvatar":
                await handleGenerateAvatar(request, response);
                break;
            default:
                response.status(404).send("Not Found");
        }
    } catch (e: any) {
        console.error("Error in API handler:", e);
        response.status(500).json({ error: e.message || "An unexpected error occurred." });
    }
});

// FIX: Use `Request` and `Response` from express to ensure correct typing.
const handleGenerateContent = async (request: Request, response: Response) => {
  const { message, history, attachments } = request.body;
  
  response.setHeader("Content-Type", "application/json");
  response.setHeader("Transfer-Encoding", "chunked");

  const historyContents = buildHistory(history);
  const userParts: Part[] = [];
  if (attachments && attachments.length > 0) {
    userParts.push(...attachments.map((att: Attachment) => ({
      inlineData: { mimeType: att.mimeType, data: att.data }
    })));
  }
  if (message && message.trim()) {
    userParts.push({ text: message });
  }

  const contents: Content[] = [...historyContents, { role: 'user', parts: userParts }];

  try {
    const stream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            tools: tools,
            systemInstruction: { parts: [{ text: systemInstruction }] },
        }
    });

    for await (const chunk of stream) {
        const responseChunk: any = {};
        if (chunk.text) {
            responseChunk.text = chunk.text;
        }

        const groundingMeta = chunk.candidates?.[0]?.groundingMetadata;
        if (groundingMeta?.groundingChunks) {
            const sources: Source[] = groundingMeta.groundingChunks
                .map((c: GroundingChunk) => ({
                    uri: c.web?.uri || '',
                    title: c.web?.title || c.web?.uri || 'Source'
                }))
                .filter((s: Source) => s.uri);
            if (sources.length > 0) responseChunk.sources = sources;
        }

        const functionCallPart = chunk.candidates?.[0]?.content?.parts.find(p => p.functionCall);
        if (functionCallPart?.functionCall) {
            const { name, args } = functionCallPart.functionCall;
            if (name === 'createMindMap') {
                responseChunk.mindMapData = args as unknown as MindMapNode;
            } else if (name === 'scheduleEvent') {
                responseChunk.calendarEventData = args as unknown as CalendarEventData;
            }
        }
        
        if (Object.keys(responseChunk).length > 0) {
            response.write(JSON.stringify(responseChunk) + '\n');
        }
    }
    response.end();

  } catch (e: any) {
      console.error("Gemini API call failed:", e);
      if (!response.headersSent) {
        response.status(500).json({ error: e.message || "Apologies, I encountered an issue." });
      } else {
        response.end();
      }
  }
};

// FIX: Use `Request` and `Response` from express to ensure correct typing.
const handleGenerateTitle = async (request: Request, response: Response) => {
    const { message } = request.body;
    if (!message) {
        response.status(400).json({ error: "message is required" });
        return;
    }
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a short, concise title (4 words max) for the following user query: "${message}"`,
        });
        response.json({ title: result.text.replace(/"/g, '').trim() });
    } catch(e) {
        console.error("Failed to generate title in function", e);
        response.json({ title: "New Chat" });
    }
};

// FIX: Use `Request` and `Response` from express to ensure correct typing.
const handleGenerateAvatar = async (request: Request, response: Response) => {
    try {
        const result = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: 'A minimalist and friendly abstract logo for an AI assistant. Geometric shapes, calming blue and purple gradient, clean lines, vector art, on a pure white background.',
            config: { numberOfImages: 1, outputMimeType: 'image/png' }
        });
        
        if (result.generatedImages && result.generatedImages.length > 0) {
            const base64Image = result.generatedImages[0].image.imageBytes;
            response.json({ imageDataUrl: `data:image/png;base64,${base64Image}` });
        } else {
            throw new Error("No image was generated by the model.");
        }
    } catch (e: any) {
        console.error("Failed to generate avatar in function", e);
        response.status(500).json({ error: "Could not generate a new avatar at the moment." });
    }
};
import { GoogleGenAI, GenerateContentResponse, Part, Tool, FunctionDeclaration, Type, Content, FunctionCall, GroundingChunk } from "@google/genai";
import { Source, ChatMessage, Attachment, DudeStreamResponse, MindMapNode, CalendarEventData } from '../types';

let ai: GoogleGenAI | null = null;

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

// FIX: Corrected the schema for `createMindMap` to remove invalid properties like `$ref` and `definitions`.
// The recursive nature of a mind map node is implied by allowing nested children to be generic objects.
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
                                    type: Type.OBJECT, // Represent recursive type as a generic object
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
    // Other tool definitions can be added here
];

// FIX: Split functionDeclarations and googleSearch into separate objects in the tools array
// to conform to the `Tool` union type definition.
const tools: Tool[] = [
    { functionDeclarations: functionDeclarations },
    { googleSearch: {} }
];

export const initializeApi = (): boolean => {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("API_KEY environment variable not found.");
            return false;
        }
        ai = new GoogleGenAI({ apiKey });
        return true;
    } catch (e) {
        console.error("Failed to initialize GoogleGenAI", e);
        return false;
    }
};

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

export async function* sendMessageToDudeStream(
  message: string,
  history: ChatMessage[],
  attachments?: Attachment[]
): AsyncGenerator<DudeStreamResponse, void, undefined> {
  if (!ai) {
    throw new Error("AI not initialized");
  }

  const historyContents = buildHistory(history);

  const userParts: Part[] = [];
  if (attachments && attachments.length > 0) {
    userParts.push(...attachments.map(att => ({
      inlineData: { mimeType: att.mimeType, data: att.data }
    })));
  }
  if (message.trim()) {
    userParts.push({ text: message });
  }

  const contents: Content[] = [...historyContents, { role: 'user', parts: userParts }];

  try {
    // FIX: Moved `systemInstruction` into the `config` object to match the correct API structure.
    const stream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: contents,
        tools: tools,
        config: {
            systemInstruction: { parts: [{ text: systemInstruction }] },
        }
    });
    
    let accumulatedText = '';

    for await (const chunk of stream) {
      if (chunk.text) {
        accumulatedText += chunk.text;
        yield { text: accumulatedText };
      }

      const groundingMeta = chunk.candidates?.[0]?.groundingMetadata;
      if (groundingMeta?.groundingChunks) {
          const sources: Source[] = groundingMeta.groundingChunks
              .map((c: GroundingChunk) => ({
                  uri: c.web?.uri || '',
                  title: c.web?.title || c.web?.uri || 'Source'
              }))
              .filter(s => s.uri);
          if (sources.length > 0) {
              yield { sources };
          }
      }

      const functionCallPart = chunk.candidates?.[0]?.content?.parts.find(p => p.functionCall);
      if (functionCallPart?.functionCall) {
          const { name, args } = functionCallPart.functionCall;
          console.log(`Tool call detected: ${name}`, args);
          if (name === 'createMindMap') {
            // FIX: Used a double cast (`as unknown as ...`) to safely cast the generic `args` object to the specific `MindMapNode` type.
            yield { mindMapData: args as unknown as MindMapNode };
          } else if (name === 'scheduleEvent') {
            // FIX: Used a double cast (`as unknown as ...`) to safely cast the generic `args` object to the specific `CalendarEventData` type.
            yield { calendarEventData: args as unknown as CalendarEventData };
          }
      }
    }

  } catch (e: any) {
      console.error("Gemini API call failed:", e);
      throw new Error(e.message || "Apologies, I encountered an issue while processing your request.");
  }
}

export const generateTitleForChat = async (firstMessage: string): Promise<string> => {
    if (!ai) return "New Chat";
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a short, concise title (4 words max) for the following user query: "${firstMessage}"`,
        });
        return result.text.replace(/"/g, '').trim();
    } catch (e) {
        console.error("Failed to generate title", e);
        return "New Chat";
    }
};

export const generateAvatar = async (): Promise<string> => {
    if (!ai) throw new Error("AI not initialized");
    try {
        const result = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: 'A minimalist and friendly abstract logo for an AI assistant. Geometric shapes, calming blue and purple gradient, clean lines, vector art, on a pure white background.',
            config: { numberOfImages: 1, outputMimeType: 'image/png' }
        });
        
        if (result.generatedImages && result.generatedImages.length > 0) {
            const base64Image = result.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64Image}`;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (e) {
        console.error("Failed to generate avatar", e);
        throw new Error("Could not generate a new avatar at the moment.");
    }
};
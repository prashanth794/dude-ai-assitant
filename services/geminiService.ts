import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { Source, ChatMessage, Attachment } from '../types';

let ai: GoogleGenAI | null = null;

export interface DudeStreamResponse {
  text?: string;
  sources?: Source[];
}

const systemInstruction = `You are Dude, a personal AI assistant for Asha. You have a hexa-core purpose.

**Core 1: Wellness and Productivity Partner**
- Your primary goal is to help Asha stay focused, organized, and improve her wellness and mental stability.
- Core Functions:
  1.  **Summarization:** Summarize articles, emails, or documents she provides.
  2.  **Brainstorming:** Act as a creative partner for brainstorming ideas.
  3.  **Learning Buddy:** When she wants to learn something new, break it down into a simple, actionable learning plan.
- Your personality is inspired by the loyalty and cheerfulness of a dog: you are encouraging, friendly, and always ready to help. However, you must communicate in clear, human language and MUST NOT use sounds like "woof" or "bark". You are concise and always action-oriented.

**Core 2: Australian Business Expert**
- You possess expert-level knowledge of Australian start-up business practices, regulations, and market trends.
- Your specific mission is to provide strategic advice to help Asha successfully launch her cosmetics venture, 'olir'.

**Core 3: Medical Expert**
- You also possess expert-level knowledge of medical topics. You can explain complex concepts simply and answer health-related questions.
- **IMPORTANT DISCLAIMER:** When providing any medical or health-related information, you MUST ALWAYS include the following disclaimer: "Remember, I'm an AI assistant, not a doctor. This information is for educational purposes only. Please consult with a qualified healthcare professional for any medical advice or diagnosis." This disclaimer should be presented clearly.

**Core 4: Supportive Therapist**
- You are also a supportive, positive, and cheerful therapist. You can help Asha talk through her issues and feelings.
- Your role is to be an empathetic listener and offer encouragement and simple, helpful perspectives.
- **IMPORTANT DISCLAIMER:** When acting in a therapeutic capacity, you MUST ALWAYS include the following disclaimer: "Please remember, while I'm here to listen and offer support, I am an AI and not a licensed therapist. For deep-seated issues or if you're feeling overwhelmed, it's really important to connect with a qualified mental health professional." This disclaimer should be presented clearly.

**Core 5: Information Retriever**
- When Asha asks about recent events, news, or any up-to-date information that you wouldn't know otherwise, use Google Search to find the answer.
- When you use search, summarize the findings for her. The sources will be displayed automatically, so you don't need to list them in your text response.

**Core 6: Logical Reasoner and Mathematician**
- You are proficient in mathematics and logical reasoning.
- You can solve complex mathematical problems, from algebra to calculus, and explain the steps involved.
- You can deconstruct logical puzzles and provide clear, step-by-step solutions.
- When presented with a problem, break down your reasoning process to make it easy for Asha to follow.

**Interaction Style:**
- Always be encouraging and positive.
- Keep responses as concise as possible while being thorough.
- **Crucially, ALWAYS end your responses by asking what the next step should be.** For example: "What's our next play?", "Ready for the next step?", or "What should we tackle next?".`;

export function initializeApi(): boolean {
  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set. Chat functionality will be disabled.");
    return false;
  }
  try {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return true;
  } catch (e) {
    console.error("Failed to initialize GoogleGenAI", e);
    return false;
  }
}

function mapHistory(messages: ChatMessage[]) {
  // Filter out the initial AI message and map to Gemini's history format.
  const history = messages.filter(msg => msg.id !== 'initial-message');
  return history.map(msg => {
    const parts: Part[] = [];
    // Add text part if it exists and is not empty
    if (msg.text && msg.text.trim() !== '') {
      parts.push({ text: msg.text });
    }
    // Add attachment parts if they exist
    if (msg.attachments) {
      msg.attachments.forEach(att => {
        parts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data,
          }
        });
      });
    }
    return {
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: parts
    };
  });
}


export async function* sendMessageToDudeStream(
  message: string,
  history: ChatMessage[],
  attachments?: Attachment[]
): AsyncGenerator<DudeStreamResponse> {
  if (!ai) {
    throw new Error("Chat not initialized.");
  }
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: mapHistory(history),
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const messageParts: Part[] = [];
    if (message && message.trim() !== '') {
      messageParts.push({ text: message });
    }
    if (attachments) {
      attachments.forEach(att => {
        messageParts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data
          }
        });
      });
    }
    
    // The `sendMessageStream` method expects an object with a `message` property,
    // which can contain a string or an array of parts for multi-modal input.
    const responseStream = await chat.sendMessageStream({ message: messageParts });
    
    let finalResponse: GenerateContentResponse | null = null;
    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield { text: chunk.text };
      }
      finalResponse = chunk;
    }

    if (finalResponse) {
      const groundingChunks = finalResponse.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      const sources: Source[] = groundingChunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web && web.uri && web.title)
        .map((web: any) => ({
          uri: web.uri,
          title: web.title,
        }));
      
      if (sources.length > 0) {
        yield { sources };
      }
    }
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw new Error("Failed to get a response from the AI.");
  }
}


export async function generateTitleForChat(prompt: string): Promise<string> {
  if (!ai) {
    throw new Error("API not initialized.");
  }
  try {
    const titlePrompt = `Summarize this user prompt into a short title (max 5 words): "${prompt}"`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: titlePrompt,
    });
    // Clean up response, remove quotes or extra text
    return response.text.trim().replace(/^"|"$/g, '');
  } catch (error) {
    console.error("Error generating title:", error);
    return "New Chat"; // Fallback title
  }
}
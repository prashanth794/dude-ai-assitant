import { ChatMessage, Attachment, DudeStreamResponse, Source, MindMapNode, CalendarEventData } from '../types';

/**
 * All functions in this file now communicate with a secure backend (Firebase Cloud Function)
 * instead of calling the Google GenAI SDK directly. The API key is managed on the server.
 */

export const initializeApi = (): boolean => {
  // This function is no longer needed as the API is initialized on the server.
  // We return true to maintain the app's startup flow.
  return true;
};


export async function* sendMessageToDudeStream(
  message: string,
  history: ChatMessage[],
  attachments?: Attachment[]
): AsyncGenerator<DudeStreamResponse, void, undefined> {
  try {
    const response = await fetch('/api/generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, attachments }),
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep the last, possibly incomplete line

      for (const line of lines) {
        if (line.trim()) {
          try {
            const parsedChunk = JSON.parse(line);
            yield parsedChunk;
          } catch (e) {
            console.error("Failed to parse stream chunk:", line, e);
          }
        }
      }
    }
    
    // Process any remaining data in the buffer
    if (buffer.trim()) {
        try {
            const parsedChunk = JSON.parse(buffer);
            yield parsedChunk;
        } catch (e) {
            console.error("Failed to parse final stream chunk:", buffer, e);
        }
    }

  } catch (e: any) {
    console.error("API call to backend function failed:", e);
    throw new Error(e.message || "Apologies, I encountered an issue while processing your request.");
  }
}

export const generateTitleForChat = async (firstMessage: string): Promise<string> => {
  try {
    const response = await fetch('/api/generateTitle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: firstMessage }),
    });
    if (!response.ok) {
      throw new Error('Failed to generate title from server.');
    }
    const data = await response.json();
    return data.title || "New Chat";
  } catch (e) {
    console.error("Failed to generate title", e);
    return "New Chat";
  }
};

export const generateAvatar = async (): Promise<string> => {
    try {
        const response = await fetch('/api/generateAvatar', { method: 'POST' });
        if (!response.ok) {
            throw new Error('Failed to generate avatar from server.');
        }
        const data = await response.json();
        if (data.imageDataUrl) {
            return data.imageDataUrl;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (e) {
        console.error("Failed to generate avatar", e);
        throw new Error("Could not generate a new avatar at the moment.");
    }
};

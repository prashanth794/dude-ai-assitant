export type Sender = 'user' | 'ai';

export interface Source {
  uri: string;
  title: string;
}

export interface Attachment {
  mimeType: string;
  data: string; // base64 encoded string
}

export interface MindMapNode {
  title: string;
  children?: MindMapNode[];
}

export interface CalendarEventData {
  title: string;
  startTime: string; // ISO 8601 format
  duration: number; // in minutes
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: Sender;
  sources?: Source[];
  attachments?: Attachment[];
  mindMapData?: MindMapNode;
  calendarEventData?: CalendarEventData;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

export interface DudeStreamResponse {
  text?: string;
  sources?: Source[];
  attachment?: Attachment;
  mindMapData?: MindMapNode;
  calendarEventData?: CalendarEventData;
}
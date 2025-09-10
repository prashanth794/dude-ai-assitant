export type Sender = 'user' | 'ai';

export interface Source {
  uri: string;
  title: string;
}

export interface Attachment {
  mimeType: string;
  data: string; // base64 encoded string
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: Sender;
  sources?: Source[];
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}
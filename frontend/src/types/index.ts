export type DocumentStatus = "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface AskPdfDocument {
  _id: string;
  filename: string;
  status: DocumentStatus;
  chunkCount: number;
  uploadedAt: string;
  processedAt: string | null;
  error: string | null;
  progress?: number;
}

export interface Source {
  filename: string;
  pageNumber?: number | null;
}

export type MessageRole = "user" | "assistant";

export interface Message {
  _id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  sources?: Source[];
  createdAt: string;
  streaming?: boolean;
}

export interface Conversation {
  _id: string;
  documentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  documentId: string;
  jobId: string;
}

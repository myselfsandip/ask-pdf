import type { AskPdfDocument, Conversation, Message, UploadResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

type TokenGetter = () => Promise<string | null>;

async function authHeaders(getToken?: TokenGetter): Promise<HeadersInit> {
  if (!getToken) return {};
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Request failed with ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async uploadDocument(file: File, getToken?: TokenGetter): Promise<UploadResponse> {
    const form = new FormData();
    form.append("pdf", file);
    const res = await fetch(`${API_URL}/documents`, {
      method: "POST",
      headers: await authHeaders(getToken),
      body: form,
    });
    return handle<UploadResponse>(res);
  },

  async listDocuments(getToken?: TokenGetter): Promise<AskPdfDocument[]> {
    const res = await fetch(`${API_URL}/documents`, {
      headers: await authHeaders(getToken),
      cache: "no-store",
    });
    const data = await handle<{ documents: AskPdfDocument[] } | AskPdfDocument[]>(res);
    return Array.isArray(data) ? data : data.documents;
  },


  async getDocumentStatus(documentId: string, getToken?: TokenGetter): Promise<AskPdfDocument> {
    const res = await fetch(`${API_URL}/documents/${documentId}`, {
      headers: await authHeaders(getToken),
      cache: "no-store",
    });
    const data = await handle<{ document: AskPdfDocument }>(res);
    return data.document;
  },

  async deleteDocument(documentId: string, getToken?: TokenGetter): Promise<void> {
    const res = await fetch(`${API_URL}/documents/${documentId}`, {
      method: "DELETE",
      headers: await authHeaders(getToken),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.message ?? "Failed to delete document");
    }
  },


  async getConversation(conversationId: string, getToken?: TokenGetter): Promise<Message[]> {
    const res = await fetch(`${API_URL}/chat/conversations/${conversationId}`, {
      headers: await authHeaders(getToken),
      cache: "no-store",
    });
    const data = await handle<{ messages: Message[] } | Message[]>(res);
    return Array.isArray(data) ? data : data.messages;
  },


  async streamChat(
    params: { documentId: string; conversationId?: string; question: string },
    handlers: {
      onToken: (partial: string) => void;
      onSources: (sources: Message["sources"]) => void;
      onDone: (conversationId: string) => void;
      onError: (error: string) => void;
    },
    getToken?: TokenGetter
  ): Promise<void> {
    const res = await fetch(`${API_URL}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders(getToken)),
      },
      body: JSON.stringify(params),
    });

    if (!res.ok || !res.body) {
      handlers.onError(`Request failed with ${res.status}`);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let conversationId = params.conversationId ?? "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line.
      const rawEvents = buffer.split("\n\n");
      buffer = rawEvents.pop() ?? "";

      for (const raw of rawEvents) {
        let eventType = "message";
        let dataLine = "";

        for (const line of raw.split("\n")) {
          if (line.startsWith("event:")) {
            eventType = line.slice("event:".length).trim();
          } else if (line.startsWith("data:")) {
            dataLine = line.slice("data:".length).trim();
          }
        }

        if (!dataLine) continue;

        let payload: unknown;
        try {
          payload = JSON.parse(dataLine);
        } catch {
          continue; // ignore malformed keep-alive lines
        }

        switch (eventType) {
          case "conversationId":
            conversationId = payload as string;
            break;
          case "token":
            handlers.onToken(payload as string);
            break;
          case "sources":
            handlers.onSources(payload as Message["sources"]);
            break;
          case "done":
            handlers.onDone(conversationId);
            break;
          case "error":
            handlers.onError(payload as string);
            break;
        }
      }
    }
  },
};

export async function pollDocumentStatus(
  documentId: string,
  onUpdate: (doc: AskPdfDocument) => void,
  getToken?: TokenGetter,
  intervalMs = 2000
): Promise<() => void> {
  let cancelled = false;

  const tick = async () => {
    if (cancelled) return;
    try {
      const doc = await api.getDocumentStatus(documentId, getToken);
      onUpdate(doc);
      if (doc.status === "COMPLETED" || doc.status === "FAILED") return;
    } catch {
    }
    if (!cancelled) setTimeout(tick, intervalMs);
  };

  tick();
  return () => {
    cancelled = true;
  };
}

export type { Conversation };
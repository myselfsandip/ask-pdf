"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import { api } from "@/lib/api";
import type { Message } from "@/types";

export function useChat(documentId: string, initialConversationId?: string) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(Boolean(initialConversationId));

  useEffect(() => {
    if (!initialConversationId) return;
    (async () => {
      try {
        const history = await api.getConversation(initialConversationId, getToken);
        setMessages(history);
      } catch {
        // A missing conversation just starts fresh — not fatal.
      } finally {
        setHistoryLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConversationId]);

  const ask = useCallback(
    async (question: string) => {
      setError(null);
      const userMessage: Message = {
        _id: `local-${Date.now()}`,
        conversationId: conversationId ?? "",
        role: "user",
        content: question,
        createdAt: new Date().toISOString(),
      };
      const assistantId = `local-${Date.now()}-assistant`;
      const assistantMessage: Message = {
        _id: assistantId,
        conversationId: conversationId ?? "",
        role: "assistant",
        content: "",
        streaming: true,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      let buffer = "";

      await api.streamChat(
        { documentId, conversationId, question },
        {
          onToken: (partial) => {
            buffer += partial;
            setMessages((prev) =>
              prev.map((m) => (m._id === assistantId ? { ...m, content: buffer } : m))
            );
          },
          onSources: (sources) => {
            setMessages((prev) =>
              prev.map((m) => (m._id === assistantId ? { ...m, sources } : m))
            );
          },
          onDone: (newConversationId) => {
            if (newConversationId) setConversationId(newConversationId);
            setMessages((prev) =>
              prev.map((m) => (m._id === assistantId ? { ...m, streaming: false } : m))
            );
            setIsStreaming(false);
          },
          onError: (message) => {
            setError(message);
            setIsStreaming(false);
            setMessages((prev) =>
              prev.map((m) =>
                m._id === assistantId
                  ? {
                      ...m,
                      streaming: false,
                      content:
                        m.content || "Something went wrong while generating this answer.",
                    }
                  : m
              )
            );
          },
        },
        getToken
      );
    },
    [documentId, conversationId, getToken]
  );

  return { messages, ask, isStreaming, error, conversationId, historyLoading };
}

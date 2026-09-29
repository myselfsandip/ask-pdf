"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { ChatWindow } from "@/components/chat-window";
import { ChatInput } from "@/components/chat-input";
import { useChat } from "@/hooks/use-chat";
import { api } from "@/lib/api";

export default function ChatPage() {
  const params = useParams<{ documentId: string }>();
  const searchParams = useSearchParams();
  const { getToken } = useAuth();
  const documentId = params.documentId;
  const initialConversationId = searchParams.get("conversationId") ?? undefined;

  const [filename, setFilename] = useState<string>("");
  const { messages, ask, isStreaming, error, historyLoading } = useChat(
    documentId,
    initialConversationId
  );

  useEffect(() => {
    api
      .getDocumentStatus(documentId, getToken)
      .then((doc) => setFilename(doc.filename))
      .catch(() => setFilename("Document"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col">
      <SiteHeader documentTitle={filename} />
      <ChatWindow messages={messages} historyLoading={historyLoading} />
      <ChatInput onSend={ask} disabled={isStreaming} />
    </div>
  );
}

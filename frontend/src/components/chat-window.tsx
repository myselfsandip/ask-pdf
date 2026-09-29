"use client";

import { useEffect, useRef } from "react";
import { Loader2, MessageCircle } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/message-bubble";
import type { Message } from "@/types";

export function ChatWindow({
  messages,
  historyLoading,
}: {
  messages: Message[];
  historyLoading: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ScrollArea className="flex-1">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-8">
        {historyLoading ? (
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading conversation…
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <MessageCircle className="h-8 w-8 text-ink-muted" />
            <p className="max-w-sm text-sm text-ink-muted">
              Ask a question about this document to get started. Answers are grounded
              only in what&apos;s written on its pages.
            </p>
          </div>
        ) : (
          messages.map((message) => <MessageBubble key={message._id} message={message} />)
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}

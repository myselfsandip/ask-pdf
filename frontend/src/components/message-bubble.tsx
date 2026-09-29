import { cn } from "@/lib/utils";
import { SourceCitation } from "@/components/source-citation";
import type { Message } from "@/types";

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex animate-fade-up", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[80%]", isUser ? "" : "w-full")}>
        {isUser ? (
          <div className="rounded-lg rounded-br-sm bg-accent px-4 py-2.5 text-sm text-accent-foreground">
            {message.content}
          </div>
        ) : (
          <div className="px-1 py-1">
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
              {message.content}
              {message.streaming && (
                <span className="ml-0.5 inline-block h-4 w-1.5 -translate-y-0.5 animate-pulse bg-ink-muted align-middle" />
              )}
            </p>
            {message.sources && <SourceCitation sources={message.sources} />}
          </div>
        )}
      </div>
    </div>
  );
}

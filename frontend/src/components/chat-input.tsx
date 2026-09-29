"use client";

import { useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (question: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="border-t border-border bg-paper px-6 py-4"
    >
      <div className="mx-auto flex max-w-2xl items-end gap-2 rounded-lg border border-border bg-surface p-2">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Ask something about this document…"
          className="max-h-40 min-h-[40px] border-none bg-transparent px-2 shadow-none focus-visible:ring-0"
          rows={1}
        />
        <Button type="submit" size="icon" disabled={disabled || !value.trim()}>
          <ArrowUp />
        </Button>
      </div>
    </form>
  );
}

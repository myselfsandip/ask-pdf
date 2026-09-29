import { BookMarked } from "lucide-react";

import type { Source } from "@/types";

export function SourceCitation({ sources }: { sources: Source[] }) {
  if (!sources.length) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1 text-xs text-ink-muted">
        <BookMarked className="h-3 w-3" /> Sources
      </span>
      {sources.map((source, i) => (
        <span
          key={`${source.filename}-${source.pageNumber}-${i}`}
          className="mark-underline rounded-sm px-1 text-xs text-ink"
        >
          {source.filename} — page {source.pageNumber}
        </span>
      ))}
    </div>
  );
}

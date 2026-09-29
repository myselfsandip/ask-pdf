import { Progress } from "@/components/ui/progress";
import type { DocumentStatus } from "@/types";

const STATUS_COPY: Record<DocumentStatus, string> = {
  UPLOADED: "Queued for processing…",
  PROCESSING: "Reading and indexing your document…",
  COMPLETED: "Ready to chat",
  FAILED: "Processing failed",
};

export function ProcessingStatus({
  status,
  progress,
}: {
  status: DocumentStatus;
  progress?: number;
}) {
  if (status === "COMPLETED" || status === "FAILED") {
    return null;
  }

  return (
    <div className="mt-3 space-y-2">
      <Progress value={progress ?? 15} />
      <p className="text-xs text-ink-muted">{STATUS_COPY[status]}</p>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, MessageSquare, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProcessingStatus } from "@/components/processing-status";
import { formatDate, cn } from "@/lib/utils";
import type { AskPdfDocument } from "@/types";

const STATUS_DOT: Record<AskPdfDocument["status"], string> = {
  UPLOADED: "bg-ink-muted",
  PROCESSING: "bg-accent",
  COMPLETED: "bg-success",
  FAILED: "bg-danger",
};

const STATUS_LABEL: Record<AskPdfDocument["status"], string> = {
  UPLOADED: "Queued",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

export function DocumentCard({
  document,
  onDelete,
}: {
  document: AskPdfDocument;
  onDelete: (id: string) => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isReady = document.status === "COMPLETED";

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(document._id);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="animate-fade-up border-b border-border py-5 first:pt-0 last:border-none">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" />
          <div className="min-w-0">
            <p className="truncate font-serif-display text-base font-semibold text-ink">
              {document.filename}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-ink-muted">
              <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[document.status])} />
              <span>{STATUS_LABEL[document.status]}</span>
              <span aria-hidden>·</span>
              <span>Uploaded {formatDate(document.uploadedAt)}</span>
              {isReady && document.chunkCount > 0 && (
                <>
                  <span aria-hidden>·</span>
                  <span>{document.chunkCount} chunks indexed</span>
                </>
              )}
            </div>
            {document.status === "FAILED" && document.error && (
              <p className="mt-1 text-xs text-danger">{document.error}</p>
            )}
            <ProcessingStatus status={document.status} progress={document.progress} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button asChild size="sm" variant={isReady ? "default" : "outline"} disabled={!isReady}>
            <Link href={isReady ? `/chat/${document._id}` : "#"}>
              <MessageSquare />
              Open chat
            </Link>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setConfirmOpen(true)}
            aria-label={`Delete ${document.filename}`}
          >
            <Trash2 className="text-ink-muted" />
          </Button>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this document?</DialogTitle>
            <DialogDescription>
              This removes “{document.filename}”, its indexed chunks, and every
              conversation tied to it. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

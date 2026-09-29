"use client";

import { FileQuestion, Loader2 } from "lucide-react";

import { DocumentCard } from "@/components/document-card";
import type { AskPdfDocument } from "@/types";

export function DocumentList({
  documents,
  loading,
  error,
  onDelete,
}: {
  documents: AskPdfDocument[];
  loading: boolean;
  error: string | null;
  onDelete: (id: string) => Promise<void>;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-ink-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading your documents…
      </div>
    );
  }

  if (error) {
    return <p className="py-16 text-sm text-danger">{error}</p>;
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <FileQuestion className="h-8 w-8 text-ink-muted" />
        <p className="text-sm text-ink-muted">
          Nothing here yet. Upload a PDF to start asking it questions.
        </p>
      </div>
    );
  }

  return (
    <div>
      {documents.map((doc) => (
        <DocumentCard key={doc._id} document={doc} onDelete={onDelete} />
      ))}
    </div>
  );
}

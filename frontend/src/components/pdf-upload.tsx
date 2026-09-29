"use client";

import { useCallback, useRef, useState } from "react";
import { FileText, Loader2, UploadCloud } from "lucide-react";

import { useUpload } from "@/hooks/use-upload";
import { cn } from "@/lib/utils";
import type { UploadResponse } from "@/types";

export function PdfUpload({
  onUploaded,
}: {
  onUploaded: (result: UploadResponse, file: File) => void;
}) {
  const { upload, uploading, error, setError } = useUpload();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      const result = await upload(file);
      if (result) onUploaded(result, file);
    },
    [upload, onUploaded]
  );

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          setError(null);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border bg-surface px-8 py-16 text-center transition-colors",
          isDragging && "border-accent bg-marker-soft/40",
          uploading && "pointer-events-none opacity-70"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            setError(null);
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {uploading ? (
          <Loader2 className="h-9 w-9 animate-spin text-accent" />
        ) : (
          <UploadCloud className="h-9 w-9 text-ink-muted transition-colors group-hover:text-accent" />
        )}
        <div>
          <p className="text-base font-medium text-ink">
            {uploading ? "Uploading…" : "Drop a PDF here, or click to browse"}
          </p>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-ink-muted">
            <FileText className="h-3.5 w-3.5" /> PDF only · up to 20 MB
          </p>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </div>
  );
}

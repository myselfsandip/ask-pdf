"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import { api } from "@/lib/api";
import type { UploadResponse } from "@/types";

const MAX_SIZE_BYTES = 20 * 1024 * 1024;

export function useUpload() {
  const { getToken } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File): Promise<UploadResponse | null> => {
      setError(null);

      if (file.type !== "application/pdf") {
        setError("Only PDF files are supported.");
        return null;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError("File is larger than the 20 MB limit.");
        return null;
      }

      setUploading(true);
      try {
        const result = await api.uploadDocument(file, getToken);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        return null;
      } finally {
        setUploading(false);
      }
    },
    [getToken]
  );

  return { upload, uploading, error, setError };
}

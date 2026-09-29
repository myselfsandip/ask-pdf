"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import { api } from "@/lib/api";
import type { AskPdfDocument } from "@/types";

export function useDocuments() {
  const { getToken } = useAuth();
  const [documents, setDocuments] = useState<AskPdfDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(
    async (mode: "initial" | "manual") => {
      try {
        setError(null);
        if (mode === "manual") setRefreshing(true);
        const docs = await api.listDocuments(getToken);
        setDocuments(docs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load documents");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getToken]
  );

  useEffect(() => {
    fetchDocuments("initial");
  }, [getToken]);

  const refresh = useCallback(() => fetchDocuments("manual"), [fetchDocuments]);

  const removeDocument = useCallback(
    async (documentId: string) => {
      await api.deleteDocument(documentId, getToken);
      setDocuments((prev) => prev.filter((d) => d._id !== documentId));
    },
    [getToken]
  );

  const addDocumentOptimistic = useCallback((doc: AskPdfDocument) => {
    setDocuments((prev) => [doc, ...prev]);
  }, []);

  return {
    documents,
    loading,
    refreshing,
    error,
    refresh,
    removeDocument,
    addDocumentOptimistic,
  };
}
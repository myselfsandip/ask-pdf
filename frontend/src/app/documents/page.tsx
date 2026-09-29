"use client";

import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { DocumentList } from "@/components/document-list";
import { Button } from "@/components/ui/button";
import { useDocuments } from "@/hooks/use-documents";
import { cn } from "@/lib/utils";

export default function DocumentsPage() {
  const { documents, loading, refreshing, error, refresh, removeDocument } = useDocuments();

  const handleDelete = async (id: string) => {
    try {
      await removeDocument(id);
      toast.success("Document deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete document");
    }
  };

  const handleRefresh = async () => {
    await refresh();
    toast.success("Documents refreshed");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-14 md:px-10">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="font-serif-display text-3xl font-semibold text-ink">
              My documents
            </h1>
            <p className="mt-2 text-sm text-ink-muted">
              Everything you&apos;ve uploaded. Still processing?{" "}
              <button
                onClick={handleRefresh}
                className="underline underline-offset-2 hover:text-ink"
              >
                Refresh
              </button>{" "}
              to check.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button asChild size="sm">
              <Link href="/">
                <Plus /> Upload
              </Link>
            </Button>
          </div>
        </div>

        <DocumentList
          documents={documents}
          loading={loading}
          error={error}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}
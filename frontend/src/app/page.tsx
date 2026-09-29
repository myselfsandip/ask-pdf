"use client";

import { useRouter } from "next/navigation";
import { FileStack, MessagesSquare, ShieldCheck } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { PdfUpload } from "@/components/pdf-upload";
import { useDocuments } from "@/hooks/use-documents";
import type { UploadResponse } from "@/types";

const POINTS = [
  {
    icon: FileStack,
    title: "Any PDF, instantly indexed",
    body: "We split the document into pages and passages so answers can point back to exactly where they came from.",
  },
  {
    icon: MessagesSquare,
    title: "A real conversation",
    body: "Ask follow-up questions. Each reply streams in as it's written, with citations attached.",
  },
  {
    icon: ShieldCheck,
    title: "Answers stay on the page",
    body: "If it isn't in the document, AskPDF says so instead of guessing.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { addDocumentOptimistic } = useDocuments();

  const handleUploaded = (result: UploadResponse, file: File) => {
    addDocumentOptimistic({
      _id: result.documentId,
      filename: file.name,
      status: "UPLOADED",
      chunkCount: 0,
      uploadedAt: new Date().toISOString(),
      processedAt: null,
      error: null,
    });
    router.push("/documents");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto grid max-w-5xl gap-16 px-6 pb-24 pt-20 md:grid-cols-2 md:px-10">
          <div className="animate-fade-up">
            <h1 className="font-serif-display text-4xl font-semibold leading-[1.1] text-ink md:text-5xl">
              Ask your <span className="mark-underline">documents</span> anything.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-muted">
              Upload a PDF and talk to it like you would a colleague who actually
              read the whole thing — with page references, every time.
            </p>

            <ul className="mt-12 space-y-6">
              {POINTS.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-4">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <p className="font-medium text-ink">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-center">
            <PdfUpload onUploaded={handleUploaded} />
          </div>
        </section>
      </main>
    </div>
  );
}

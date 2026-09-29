import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function SiteHeader({ documentTitle }: { documentTitle?: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6 md:px-10">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-serif-display text-lg font-semibold text-ink">
          Ask<span className="mark-underline">PDF</span>
        </Link>
        {documentTitle && (
          <>
            <span className="hidden text-ink-muted sm:inline">/</span>
            <span className="hidden max-w-[280px] truncate text-sm text-ink-muted sm:inline">
              {documentTitle}
            </span>
          </>
        )}
      </div>
      <nav className="flex items-center gap-6">
        <Link
          href="/documents"
          className="text-sm text-ink-muted transition-colors hover:text-ink"
        >
          My documents
        </Link>
        <UserButton />
      </nav>
    </header>
  );
}

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-serif-display text-2xl font-semibold text-ink">
            Ask<span className="mark-underline">PDF</span>
          </span>
          <p className="mt-2 text-sm text-ink-muted">
            Create an account to start uploading documents.
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              card: "shadow-none border border-border rounded-lg",
              footerAction: "hidden",
            },
          }}
        />
      </div>
    </div>
  );
}

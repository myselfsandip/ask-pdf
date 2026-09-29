# AskPDF — Frontend

A deliberately small Next.js frontend for the AskPDF RAG backend: upload a PDF,
watch it get indexed, then chat with it and see the pages it's quoting from.

This app is intentionally thin. All the real work — parsing, chunking,
embeddings, retrieval, generation — happens in the Express/BullMQ backend
described in the main project doc. This frontend just uploads files, polls
status, and streams chat answers.

## Stack

- Next.js 16.3.5 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui-style primitives (Radix + `class-variance-authority`)
- Clerk for authentication

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Landing page + PDF upload dropzone |
| `/documents` | List of uploaded documents with live processing status |
| `/chat/[documentId]` | Streaming chat with a single document |
| `/sign-in`, `/sign-up` | Clerk auth screens |

## Getting started

```bash
pnpm install # or npm install / yarn
cp .env.local.example .env.local
```

Fill in `.env.local`:

- `NEXT_PUBLIC_API_URL` — base URL of the Express backend's `/api` router.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` — from your
  [Clerk dashboard](https://dashboard.clerk.com).

Then:

```bash
pnpm dev
```

The app expects the backend from the main project spec to be running and to
expose:

- `POST /api/documents` — multipart upload, field name `pdf`
- `GET /api/documents`
- `GET /api/documents/:documentId/status`
- `DELETE /api/documents/:documentId`
- `POST /api/chat/stream` — Server-Sent Events, emitting
  `{"type":"token","content":"..."}`, `{"type":"sources","sources":[...]}`
  and `{"type":"done","conversationId":"..."}` events
- `GET /api/conversations/:conversationId`

If your backend also wants to verify the Clerk session, `lib/api.ts` already
attaches `Authorization: Bearer <token>` to every request using
`getToken()` from `@clerk/nextjs`; verify it on the Express side with
`@clerk/express` or by checking the JWT against Clerk's JWKS endpoint.

## Design notes

The look leans into the "reading a document" idea rather than a generic SaaS
dashboard: a serif display face for headings, a plain sans for UI, and a
single amber "highlighter" accent reserved for source citations — the one
place in the app where marking something up actually matters.

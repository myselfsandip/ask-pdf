import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

// Next.js 16 renamed `middleware.ts` -> `proxy.ts` and the exported
// function `middleware` -> `proxy`. clerkMiddleware()'s handler and
// options work exactly the same either way — only the file/export name
// changed. See: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
export const proxy = clerkMiddleware(
    async (auth, req) => {
        if (!isPublicRoute(req)) {
            await auth.protect();
        }
    },
    {
        // Widen tolerance for clock drift between this machine and Clerk's
        // servers (default is 5s). Safe to lower once the OS clock is
        // reliably synced.
        clockSkewInMs: 60_000,
    }
);

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
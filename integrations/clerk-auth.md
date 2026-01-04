# Clerk Authentication

Clerk provides complete user management with pre-built UI components, social logins, and organization support.

## Installation

```bash
pnpm add @clerk/nextjs
pnpm add -D @clerk/testing
```

## Environment Variables

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

## Setup

### Provider (App Router)

```tsx
// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Proxy (Next.js 16+)

Next.js 16 replaces `middleware.ts` with `proxy.ts` for auth handling:

```ts
// proxy.ts
import { clerkProxy, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkProxy(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});
```

### Middleware (Next.js 15 and earlier)

For projects still on Next.js 15:

```ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

## UI Components

### Sign In/Up Buttons

```tsx
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header>
      <SignedOut>
        <SignInButton />
        <SignUpButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
}
```

### Custom Sign In Page

```tsx
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
```

### Custom Sign Up Page

```tsx
// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
```

## Server-Side Auth

### In Server Components

```tsx
// app/dashboard/page.tsx
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.firstName}</h1>
    </div>
  );
}
```

### In Server Actions

```ts
// actions/profile.ts
"use server";

import { auth } from "@clerk/nextjs/server";

export async function updateProfile(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Update user profile...
}
```

### In API Routes

```ts
// app/api/user/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ userId });
}
```

## Client-Side Auth

```tsx
"use client";

import { useAuth, useUser } from "@clerk/nextjs";

export function ClientComponent() {
  const { isLoaded, userId, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <div>Sign in to continue</div>;

  return <div>Hello, {user?.firstName}</div>;
}
```

## With tRPC

```ts
// packages/api/src/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@clerk/nextjs/server";

const t = initTRPC.context<Context>().create();

const isAuthed = t.middleware(async ({ ctx, next }) => {
  const { userId } = await auth();
  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, userId } });
});

export const protectedProcedure = t.procedure.use(isAuthed);
```

## With Drizzle

```ts
// db/schema.ts
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Sync User on Sign Up (Webhook)

```ts
// app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function POST(req: Request) {
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  const evt = wh.verify(body, {
    "svix-id": svix_id!,
    "svix-timestamp": svix_timestamp!,
    "svix-signature": svix_signature!,
  }) as WebhookEvent;

  if (evt.type === "user.created") {
    await db.insert(users).values({
      id: evt.data.id,
      email: evt.data.email_addresses[0]?.email_address ?? "",
      name: `${evt.data.first_name} ${evt.data.last_name}`.trim(),
    });
  }

  return new Response("OK");
}
```

## Testing with Clerk

```ts
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";

test("authenticated user can access dashboard", async ({ page }) => {
  await setupClerkTestingToken({ page });
  await page.goto("/dashboard");
  await expect(page.getByText("Welcome")).toBeVisible();
});
```


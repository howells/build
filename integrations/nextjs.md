# Next.js

Next.js 16 with App Router, Server Components, and Server Actions. No Pages Router.

## Installation

```bash
pnpm create next-app@latest my-app --typescript --tailwind --eslint --app --src-dir
```

## Configuration

### next.config.ts

```ts
import type { NextConfig } from "next";

const config: NextConfig = {
  reactCompiler: true,
  experimental: {
    typedRoutes: true,
    optimizeCss: true,
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.example.com" },
    ],
  },
};

export default config;
```

Key options:
- `reactCompiler: true` — Enable React Compiler (auto-memoization)
- `typedRoutes: true` — Type-safe route parameters
- `optimizeCss: true` — CSS optimization for production
- `optimizePackageImports` — Tree-shake large icon/component libraries

### Image Configuration

```ts
images: {
  formats: ["image/avif", "image/webp"],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256],
  remotePatterns: [
    { protocol: "https", hostname: "**.example.com" },
  ],
}
```

Use wildcard patterns (`**`) for CDN subdomains.

## App Structure

```
src/app/
├── layout.tsx          # Root layout with providers
├── page.tsx            # Home route
├── loading.tsx         # Suspense fallback
├── error.tsx           # Error boundary
├── not-found.tsx       # 404 page
├── (auth)/             # Route group (no URL segment)
│   ├── sign-in/page.tsx
│   └── sign-up/page.tsx
├── dashboard/
│   ├── layout.tsx      # Nested layout
│   ├── page.tsx
│   └── [id]/page.tsx   # Dynamic route
└── api/
    ├── trpc/[...trpc]/route.ts
    └── webhooks/stripe/route.ts
```

## Layouts

### Root Layout

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCQueryProvider } from "@/components/trpc-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "My App",
  description: "App description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClerkProvider>
          <NuqsAdapter>
            <TRPCQueryProvider>
              {children}
            </TRPCQueryProvider>
          </NuqsAdapter>
        </ClerkProvider>
      </body>
    </html>
  );
}
```

Provider order: Auth > URL state > Data fetching > Theme

### Dynamic Metadata

```tsx
// src/app/posts/[slug]/page.tsx
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  return <Article post={post} />;
}
```

## Loading & Error States

### loading.tsx

```tsx
// src/app/dashboard/loading.tsx
import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex h-full items-center justify-center">
      <Spinner />
    </div>
  );
}
```

### error.tsx

```tsx
// src/app/dashboard/error.tsx
"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h2>Something went wrong</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

### not-found.tsx

```tsx
// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h1>Page not found</h1>
      <Link href="/">Go home</Link>
    </div>
  );
}
```

## Server Components

Server Components are the default. Use them for:
- Data fetching
- Database queries
- Accessing backend resources
- Keeping sensitive logic server-side

```tsx
// src/app/posts/page.tsx
import { db } from "@/lib/db";

export default async function PostsPage() {
  const posts = await db.query.posts.findMany({
    orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    limit: 20,
  });

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

## Client Components

Add `"use client"` only when you need:
- Event handlers (onClick, onChange)
- useState, useEffect, or other hooks
- Browser APIs
- Third-party client libraries

```tsx
// src/components/counter.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <Button onClick={() => setCount(count + 1)}>
      Count: {count}
    </Button>
  );
}
```

## Server Actions

Place actions in dedicated files with `"use server"`:

```tsx
// src/app/posts/actions.ts
"use server";

import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreatePostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export async function createPost(formData: FormData) {
  const input = CreatePostSchema.parse({
    title: formData.get("title"),
    content: formData.get("content"),
  });

  await db.insert(posts).values(input);
  revalidatePath("/posts");
}
```

Usage in forms:

```tsx
// src/app/posts/new/page.tsx
import { createPost } from "../actions";

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="Title" required />
      <textarea name="content" placeholder="Content" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

## Route Handlers

For webhooks, external APIs, and non-tRPC endpoints:

```tsx
// src/app/api/webhooks/stripe/route.ts
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  // Verify and handle webhook
  try {
    const event = stripe.webhooks.constructEvent(body, signature!, secret);
    // Handle event...
    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
}
```

### Runtime Configuration

```tsx
// Force dynamic for webhooks, crons
export const dynamic = "force-dynamic";

// Node.js runtime for server logic
export const runtime = "nodejs";

// Extend timeout for long operations (Vercel Pro)
export const maxDuration = 300;
```

## Middleware

Protect routes at the edge:

```tsx
// src/middleware.ts
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
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

## URL State with nuqs

Keep filters, pagination, and UI state in the URL:

```tsx
// src/app/products/page.tsx
import { parseAsString, parseAsInteger, createSearchParamsCache } from "nuqs/server";

const searchParamsCache = createSearchParamsCache({
  search: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  category: parseAsString,
});

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const { search, page, category } = searchParamsCache.parse(await searchParams);

  const products = await getProducts({ search, page, category });

  return <ProductList products={products} />;
}
```

Client-side updates:

```tsx
"use client";

import { useQueryState } from "nuqs";

export function SearchInput() {
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });

  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

## Static Generation

### generateStaticParams

Pre-render dynamic routes at build time:

```tsx
// src/app/posts/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await db.query.posts.findMany({
    columns: { slug: true },
  });

  return posts.map((post) => ({ slug: post.slug }));
}
```

### Revalidation

```tsx
// Time-based revalidation
export const revalidate = 3600; // Revalidate every hour

// On-demand revalidation in Server Actions
import { revalidatePath, revalidateTag } from "next/cache";

revalidatePath("/posts");
revalidateTag("posts");
```

## Best Practices

1. **Server Components by default** — Only add `"use client"` when needed
2. **Colocate Server Actions** — Keep actions in `actions.ts` files near their routes
3. **Use nuqs for URL state** — Filters, pagination, modals in URL for shareability
4. **Error boundaries per route** — Add error.tsx at each route segment level
5. **Loading states matter** — Add loading.tsx for better perceived performance
6. **Validate env at startup** — Fail fast with clear error messages
7. **Type your route params** — Use `Promise<{ param: string }>` for async params
8. **Middleware for auth** — Centralize route protection, not per-page checks

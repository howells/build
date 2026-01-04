# tRPC

tRPC provides end-to-end typesafe APIs without code generation. Define procedures on the server, call them from the client with full TypeScript inference.

## Installation

```bash
pnpm add @trpc/server @trpc/client @trpc/tanstack-react-query zod superjson
```

## React Packages

Two packages exist for React integration in tRPC 11:

| Package | Status | Notes |
|---------|--------|-------|
| `@trpc/tanstack-react-query` | **Recommended** | New package, use for new projects |
| `@trpc/react-query` | Classic | Still maintained, existing projects can stay |

For new projects, use `@trpc/tanstack-react-query` with `createTRPCContext` and `useTRPC`. This guide uses the new package.

## Monorepo Structure

```
packages/
├── api/
│   ├── src/
│   │   ├── root.ts          # Root router
│   │   ├── trpc.ts          # tRPC instance
│   │   └── routers/
│   │       ├── user.ts
│   │       └── posts.ts
│   └── package.json
apps/
└── web/
    └── lib/
        └── trpc.ts          # Client setup
```

## Server Setup

### tRPC Instance

```ts
// packages/api/src/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "@clerk/nextjs/server";

interface Context {
  userId: string | null;
}

export const createContext = async (): Promise<Context> => {
  const { userId } = await auth();
  return { userId };
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

export const protectedProcedure = t.procedure.use(isAuthed);
```

### Routers

```ts
// packages/api/src/routers/user.ts
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { db } from "@project/db";
import { users } from "@project/db/schema";
import { eq } from "drizzle-orm";

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, ctx.userId),
    });
    return user;
  }),

  update: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(users)
        .set({ name: input.name })
        .where(eq(users.id, ctx.userId));
      return { success: true };
    }),
});
```

### Root Router

```ts
// packages/api/src/root.ts
import { router } from "./trpc";
import { userRouter } from "./routers/user";
import { postsRouter } from "./routers/posts";

export const appRouter = router({
  user: userRouter,
  posts: postsRouter,
});

export type AppRouter = typeof appRouter;
```

## Client Setup

### TanStack Query Provider

```tsx
// app/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import superjson from "superjson";
import type { AppRouter } from "@project/api";

export const trpc = createTRPCReact<AppRouter>();

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

### API Route Handler

```ts
// app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@project/api";
import { createContext } from "@project/api/trpc";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
```

## Client Usage

### Queries

```tsx
"use client";

import { trpc } from "@/app/providers";

export function Profile() {
  const { data: user, isLoading } = trpc.user.me.useQuery();

  if (isLoading) return <div>Loading...</div>;

  return <div>Hello, {user?.name}</div>;
}
```

### Mutations

```tsx
"use client";

import { trpc } from "@/app/providers";

export function UpdateName() {
  const utils = trpc.useUtils();
  const updateUser = trpc.user.update.useMutation({
    onSuccess: () => {
      utils.user.me.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateUser.mutate({ name: formData.get("name") as string });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" />
      <button type="submit" disabled={updateUser.isPending}>
        {updateUser.isPending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

### Optimistic Updates

```tsx
const utils = trpc.useUtils();

const toggleLike = trpc.posts.toggleLike.useMutation({
  onMutate: async ({ postId }) => {
    await utils.posts.byId.cancel({ id: postId });
    const previous = utils.posts.byId.getData({ id: postId });

    utils.posts.byId.setData({ id: postId }, (old) =>
      old ? { ...old, liked: !old.liked, likeCount: old.likeCount + (old.liked ? -1 : 1) } : old
    );

    return { previous };
  },
  onError: (err, { postId }, ctx) => {
    utils.posts.byId.setData({ id: postId }, ctx?.previous);
  },
  onSettled: (_, __, { postId }) => {
    utils.posts.byId.invalidate({ id: postId });
  },
});
```

## Server-Side Calls

### In Server Components

```tsx
// app/dashboard/page.tsx
import { appRouter } from "@project/api";
import { createContext } from "@project/api/trpc";

export default async function DashboardPage() {
  const ctx = await createContext();
  const caller = appRouter.createCaller(ctx);

  const user = await caller.user.me();
  const posts = await caller.posts.list();

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      {posts.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

### In Server Actions

```ts
// actions/posts.ts
"use server";

import { appRouter } from "@project/api";
import { createContext } from "@project/api/trpc";
import { revalidatePath } from "next/cache";

export async function createPost(title: string, content: string) {
  const ctx = await createContext();
  const caller = appRouter.createCaller(ctx);

  await caller.posts.create({ title, content });
  revalidatePath("/posts");
}
```

## Input Validation

```ts
import { z } from "zod";

const createPostInput = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(10000),
  tags: z.array(z.string()).optional(),
});

export const postsRouter = router({
  create: protectedProcedure
    .input(createPostInput)
    .mutation(async ({ ctx, input }) => {
      // Input is fully typed and validated
      return db.insert(posts).values({
        ...input,
        authorId: ctx.userId,
      });
    }),
});
```


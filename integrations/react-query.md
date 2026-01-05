# React Query

TanStack React Query for server state management. Typically used with tRPC for end-to-end type safety.

## Installation

```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

## Setup

### QueryClient Configuration

```tsx
// src/lib/query-client.ts
import { QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000, // 1 minute
        retry: false,      // Fail fast
      },
    },
  });
}

// Singleton for SSR compatibility
let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
```

### Provider

```tsx
// src/components/query-provider.tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "@/lib/query-client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Root Layout

```tsx
// src/app/layout.tsx
import { QueryProvider } from "@/components/query-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

## useQuery

### Basic Query

```tsx
import { useQuery } from "@tanstack/react-query";

export function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => fetchUser(userId),
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return <Profile user={data} />;
}
```

### Conditional Queries

```tsx
const { data } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  enabled: Boolean(userId), // Only run when userId exists
});
```

### Query with Parameters

```tsx
const { data } = useQuery({
  queryKey: ["products", { search, category, page }],
  queryFn: () => fetchProducts({ search, category, page }),
});
```

Query keys should include all variables that affect the result.

## useMutation

### Basic Mutation

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function CreatePostForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      mutation.mutate({ title, content });
    }}>
      {/* form fields */}
      <button disabled={mutation.isPending}>
        {mutation.isPending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

### Optimistic Updates

```tsx
const mutation = useMutation({
  mutationFn: updatePost,
  onMutate: async (newData) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: ["posts", newData.id] });

    // Snapshot previous value
    const previousPost = queryClient.getQueryData(["posts", newData.id]);

    // Optimistically update
    queryClient.setQueryData(["posts", newData.id], (old: Post) => ({
      ...old,
      ...newData,
    }));

    return { previousPost };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    if (context?.previousPost) {
      queryClient.setQueryData(["posts", newData.id], context.previousPost);
    }
  },
  onSettled: () => {
    // Refetch after mutation
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  },
});
```

## Query Keys

### Convention

Use arrays with consistent structure:

```tsx
// Entity queries
["users"]                          // All users
["users", userId]                  // Single user
["users", userId, "posts"]         // User's posts

// Filtered queries
["products", { search, category }] // Products with filters
["posts", { page, limit }]         // Paginated posts
```

### Query Key Factory

```tsx
// src/lib/query-keys.ts
export const queryKeys = {
  users: {
    all: ["users"] as const,
    detail: (id: string) => ["users", id] as const,
    posts: (id: string) => ["users", id, "posts"] as const,
  },
  products: {
    all: ["products"] as const,
    list: (filters: ProductFilters) => ["products", filters] as const,
    detail: (id: string) => ["products", id] as const,
  },
};
```

Usage:

```tsx
useQuery({
  queryKey: queryKeys.users.detail(userId),
  queryFn: () => fetchUser(userId),
});

// Invalidate all user queries
queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
```

## With tRPC

tRPC generates type-safe query keys and functions automatically:

```tsx
import { useTRPC } from "@/lib/trpc";
import { useQuery, useMutation } from "@tanstack/react-query";

export function ProductList() {
  const trpc = useTRPC();

  // Query with generated options
  const { data } = useQuery(
    trpc.products.list.queryOptions({ limit: 20 })
  );

  // Get query key for invalidation
  const listKey = trpc.products.list.getQueryKey({ limit: 20 });

  // Mutation
  const mutation = useMutation({
    ...trpc.products.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKey });
    },
  });

  return (
    <ul>
      {data?.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

## Prefetching

### Client-side Prefetch

Prefetch before navigation:

```tsx
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

export function ProductCard({ product }: { product: Product }) {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const prefetch = () => {
    queryClient.prefetchQuery(
      trpc.products.detail.queryOptions({ id: product.id })
    );
  };

  return (
    <Link
      href={`/products/${product.id}`}
      onMouseEnter={prefetch}
      onFocus={prefetch}
    >
      {product.name}
    </Link>
  );
}
```

### Server-side Prefetch

Prefetch in Server Components:

```tsx
// src/app/products/[id]/page.tsx
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { createCaller } from "@/lib/trpc/server";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = getQueryClient();
  const caller = await createCaller();

  // Prefetch on server
  await queryClient.prefetchQuery({
    queryKey: ["products", id],
    queryFn: () => caller.products.detail({ id }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetail id={id} />
    </HydrationBoundary>
  );
}
```

## Infinite Queries

For paginated lists with "load more":

```tsx
import { useInfiniteQuery } from "@tanstack/react-query";

export function PostFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) => fetchPosts({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return (
    <>
      {data?.pages.flatMap((page) =>
        page.posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </button>
      )}
    </>
  );
}
```

## Devtools

```tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

Opens a panel showing:
- Active queries and their state
- Query cache contents
- Mutation history
- Ability to refetch/invalidate manually

## Best Practices

1. **Use tRPC for type safety** — Avoid manual `queryFn` and keys when possible
2. **staleTime: 60_000** — Balance freshness with performance
3. **retry: false** — Fail fast for better UX
4. **Invalidate surgically** — Use specific query keys, not broad invalidation
5. **Prefetch on hover** — Reduce perceived latency
6. **Optimistic updates for mutations** — Immediate feedback, rollback on error
7. **Query key factory** — Centralize key generation for consistency
8. **Use enabled for conditional queries** — Don't fetch until dependencies are ready

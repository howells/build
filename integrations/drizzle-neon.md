# Drizzle ORM + Neon

Drizzle is a type-safe ORM with SQL-like syntax. Neon is serverless PostgreSQL with branching and instant scaling.

## Migration Strategy

**Prefer `db:push` over formal migrations.**

| Approach | When to Use |
|----------|-------------|
| `db:push` | Default for all development and most production |
| `db:generate` + `db:migrate` | Only when you need migration history for compliance/audit |

Rationale: `db:push` is faster, simpler, and sufficient for most apps. It directly syncs your schema to the database without generating migration files. Neon's branching makes it safe to iterate quickly—create a branch, push changes, test, merge or discard.

```bash
# Development workflow
pnpm db:push      # Apply schema changes directly
pnpm db:studio    # Inspect data
```

For breaking changes (dropping columns, renaming), push still works—Drizzle will prompt for confirmation on destructive operations.

## Installation

```bash
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit
```

## Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

## Configuration

### drizzle.config.ts

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Monorepo Config

```ts
// packages/db/drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

## Database Client

### Serverless (Neon)

```ts
// db/client.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### Pooled Connection (for long-running)

```ts
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

## Schema Definition

### Basic Tables

```ts
// db/schema.ts
import { pgTable, text, timestamp, serial, integer, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Use Clerk ID
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  published: boolean("published").default(false),
  authorId: text("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Relations

```ts
import { relations } from "drizzle-orm";

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

### Enums

```ts
import { pgEnum } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", ["draft", "published", "archived"]);

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  status: statusEnum("status").default("draft"),
});
```

### Vectors (pgvector)

```ts
import { vector } from "drizzle-orm/pg-core";

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 1024 }),
});
```

## Queries

### Select

```ts
import { db } from "@/db/client";
import { users, posts } from "@/db/schema";
import { eq, and, desc, like, sql } from "drizzle-orm";

// Simple select
const allUsers = await db.select().from(users);

// With conditions
const activeUsers = await db
  .select()
  .from(users)
  .where(eq(users.active, true));

// Specific columns
const userNames = await db
  .select({ id: users.id, name: users.name })
  .from(users);

// With relations (requires schema with relations)
const userWithPosts = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    posts: true,
  },
});
```

### Insert

```ts
// Single insert
const newUser = await db
  .insert(users)
  .values({
    id: clerkUserId,
    email: "user@example.com",
    name: "John Doe",
  })
  .returning();

// Multiple insert
await db.insert(posts).values([
  { title: "Post 1", authorId: userId },
  { title: "Post 2", authorId: userId },
]);

// Upsert
await db
  .insert(users)
  .values({ id: clerkUserId, email })
  .onConflictDoUpdate({
    target: users.id,
    set: { email },
  });
```

### Update

```ts
await db
  .update(users)
  .set({ name: "New Name", updatedAt: new Date() })
  .where(eq(users.id, userId));
```

### Delete

```ts
await db.delete(posts).where(eq(posts.id, postId));
```

### Transactions

```ts
await db.transaction(async (tx) => {
  const [user] = await tx
    .insert(users)
    .values({ id, email })
    .returning();

  await tx.insert(posts).values({
    title: "Welcome Post",
    authorId: user.id,
  });
});
```

### Raw SQL

```ts
import { sql } from "drizzle-orm";

// Vector similarity search
const similar = await db
  .select({
    id: documents.id,
    content: documents.content,
    similarity: sql<number>`1 - (${documents.embedding} <=> ${embedding})`,
  })
  .from(documents)
  .orderBy(sql`${documents.embedding} <=> ${embedding}`)
  .limit(10);
```

## CLI Commands

```bash
# Push schema to database (dev)
pnpm drizzle-kit push

# Open Drizzle Studio (GUI)
pnpm drizzle-kit studio

# Generate migration
pnpm drizzle-kit generate

# Run migrations (production)
pnpm drizzle-kit migrate

# Check schema drift
pnpm drizzle-kit check
```

## Package.json Scripts

```json
{
  "scripts": {
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate"
  }
}
```

## Monorepo Package

```
packages/db/
├── src/
│   ├── index.ts          # Export client and schema
│   ├── client.ts         # Database connection
│   └── schema/
│       ├── index.ts      # Export all schemas
│       ├── users.ts
│       └── posts.ts
├── drizzle/              # Generated migrations
├── drizzle.config.ts
└── package.json
```

### package.json

```json
{
  "name": "@project/db",
  "exports": {
    ".": "./src/index.ts",
    "./schema": "./src/schema/index.ts"
  },
  "scripts": {
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

## Type Inference

```ts
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users, posts } from "./schema";

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;
```


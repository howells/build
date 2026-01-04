# Voyage AI Embeddings

Voyage AI provides state-of-the-art text embeddings optimized for semantic search and RAG applications.

## Installation

```bash
pnpm add voyage-ai-provider voyageai
```

## Environment Variables

```bash
VOYAGE_API_KEY=pa-...
```

## Basic Setup

### Provider Configuration

```ts
// lib/embeddings.ts
import { createVoyage } from "voyage-ai-provider";

export const voyage = createVoyage({
  apiKey: process.env.VOYAGE_API_KEY,
});
```

### Direct Client (Alternative)

```ts
import VoyageAI from "voyageai";

const voyage = new VoyageAI({
  apiKey: process.env.VOYAGE_API_KEY,
});
```

## Generating Embeddings

### With AI SDK Provider

```ts
import { embed, embedMany } from "ai";
import { voyage } from "@/lib/embeddings";

// Single text
const { embedding } = await embed({
  model: voyage.textEmbeddingModel("voyage-3.5"),
  value: "What is machine learning?",
});

// Multiple texts
const { embeddings } = await embedMany({
  model: voyage.textEmbeddingModel("voyage-3.5"),
  values: [
    "What is machine learning?",
    "How does neural networks work?",
    "Explain deep learning",
  ],
});
```

### With Direct Client

```ts
const result = await voyage.embed({
  input: ["Text to embed", "Another text"],
  model: "voyage-3.5",
});

const embeddings = result.data.map((d) => d.embedding);
```

## Text Embedding Models

| Model | Dimensions | Best For |
|-------|------------|----------|
| `voyage-3-large` | 2048 | SOTA text, 9.74% better than OpenAI v3 large |
| `voyage-3.5` | 1024 | General purpose text |
| `voyage-3.5-lite` | 512 | Faster, lower cost |
| `voyage-code-3` | 1024 | Code retrieval |
| `voyage-finance-2` | 1024 | Financial documents |
| `voyage-law-2` | 1024 | Legal documents |

All models support dimension reduction (2048, 1024, 512, 256) via the `output_dimension` parameter.

## Multimodal Embeddings

For image and video search:

| Model | Best For |
|-------|----------|
| `voyage-multimodal-3` | Text + images, 41% better than CLIP on table/figure retrieval |
| `voyage-multimodal-3.5` | Text + images + video |

Multimodal models process interleaved text + images (unlike CLIP which separates them). 200M text tokens + 150B pixels free per account.

```ts
// Multimodal embedding with image
const { embedding } = await embed({
  model: voyage.textEmbeddingModel("voyage-multimodal-3"),
  value: {
    content: [
      { type: "text", text: "Product description" },
      { type: "image_url", image_url: { url: "https://..." } },
    ],
  },
});
```

## Database Storage (Neon + pgvector)

### Schema

```ts
// db/schema.ts
import { pgTable, text, vector, serial } from "drizzle-orm/pg-core";

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 1024 }),
});
```

### Enable pgvector

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Insert with Embedding

```ts
import { db } from "@/db";
import { documents } from "@/db/schema";
import { embed } from "ai";
import { voyage } from "@/lib/embeddings";

async function indexDocument(content: string) {
  const { embedding } = await embed({
    model: voyage.textEmbeddingModel("voyage-3.5"),
    value: content,
  });

  await db.insert(documents).values({
    content,
    embedding,
  });
}
```

### Semantic Search

```ts
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { embed } from "ai";
import { voyage } from "@/lib/embeddings";

async function search(query: string, limit = 10) {
  const { embedding } = await embed({
    model: voyage.textEmbeddingModel("voyage-3.5"),
    value: query,
  });

  const results = await db
    .select({
      id: documents.id,
      content: documents.content,
      similarity: sql<number>`1 - (${documents.embedding} <=> ${embedding})`,
    })
    .from(documents)
    .orderBy(sql`${documents.embedding} <=> ${embedding}`)
    .limit(limit);

  return results;
}
```

## RAG Pattern

```ts
import { generateText } from "ai";
import { openrouter } from "@/lib/ai";

async function ragQuery(question: string) {
  // 1. Find relevant documents
  const relevantDocs = await search(question, 5);

  // 2. Build context
  const context = relevantDocs
    .map((doc) => doc.content)
    .join("\n\n---\n\n");

  // 3. Generate answer with context
  const { text } = await generateText({
    model: openrouter("anthropic/claude-sonnet-4"),
    system: `Answer questions based on the provided context. If the context doesn't contain relevant information, say so.`,
    prompt: `Context:\n${context}\n\nQuestion: ${question}`,
  });

  return text;
}
```

## Batch Processing

For large datasets, batch embeddings efficiently:

```ts
async function batchEmbed(texts: string[], batchSize = 100) {
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    const { embeddings } = await embedMany({
      model: voyage.textEmbeddingModel("voyage-3.5"),
      values: batch,
    });

    allEmbeddings.push(...embeddings);

    // Rate limiting
    if (i + batchSize < texts.length) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  return allEmbeddings;
}
```

## Projects Using Voyage

- **reccs** - Semantic search for recommendations
- **scenes** - Film/book similarity matching
- **populararchive** - Content embeddings for search

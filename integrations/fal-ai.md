# fal.ai Image Generation

fal.ai provides fast image generation APIs.

## Default Models

**GPT-Image 1.5** (`fal-ai/gpt-image-1.5`) - OpenAI's text-to-image model:
- Pricing: $0.009 (low) to $0.133 (high) per image
- Supports text-to-image and image editing
- Sizes: 1024x1024, 1024x1536, 1536x1024

**Gemini 2.5 Flash Image** (`fal-ai/gemini-25-flash-image`) - Google's image generation:
- Pricing: $0.039/image
- Aspect ratios: 1:1, 16:9, 4:3, etc.

## Installation

```bash
pnpm add @fal-ai/client
```

## Environment Variables

```bash
FAL_KEY=...
```

## Setup

```ts
// lib/fal.ts
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export { fal };
```

## Basic Image Generation

### GPT-Image 1.5

```ts
import { fal } from "@/lib/fal";

const result = await fal.subscribe("fal-ai/gpt-image-1.5", {
  input: {
    prompt: "A serene mountain landscape at sunset",
    image_size: "1024x1024",
    num_images: 1,
  },
});

const imageUrl = result.data.images[0].url;
```

### Gemini 2.5 Flash Image

```ts
const result = await fal.subscribe("fal-ai/gemini-25-flash-image", {
  input: {
    prompt: "Professional headshot of a business executive",
    aspect_ratio: "1:1",
  },
});
```

## Image Sizes

| Size | Dimensions | Use Case |
|------|------------|----------|
| `square` | 1024x1024 | Avatars, icons |
| `square_hd` | 1536x1536 | High-res squares |
| `portrait_4_3` | 768x1024 | Portraits |
| `portrait_16_9` | 576x1024 | Tall portraits |
| `landscape_4_3` | 1024x768 | Standard landscape |
| `landscape_16_9` | 1024x576 | Wide landscape |

## Advanced Options

```ts
const result = await fal.subscribe("fal-ai/gpt-image-1.5", {
  input: {
    prompt: "A cyberpunk city at night",
    image_size: "1536x1024",
    num_images: 4,
    quality: "high", // "low", "medium", "high"
  },
});
```

## Image Editing

GPT-Image 1.5 supports image editing:

```ts
const result = await fal.subscribe("fal-ai/gpt-image-1.5", {
  input: {
    prompt: "Add a cat sitting on the chair",
    image_url: "https://example.com/room.jpg",
  },
});
```

## Polling vs Subscription

```ts
// Subscription (recommended) - auto-polls until complete
const result = await fal.subscribe("fal-ai/gpt-image-1.5", {
  input: { prompt: "..." },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      console.log("Processing...", update.logs);
    }
  },
});

// Manual queue for long operations
const { request_id } = await fal.queue.submit("fal-ai/gpt-image-1.5", {
  input: { prompt: "..." },
});

// Check status later
const status = await fal.queue.status("fal-ai/gpt-image-1.5", {
  requestId: request_id,
});

// Get result when done
const result = await fal.queue.result("fal-ai/gpt-image-1.5", {
  requestId: request_id,
});
```

## Next.js Server Action

```ts
// actions/generate-image.ts
"use server";

import { fal } from "@/lib/fal";

export async function generateImage(prompt: string) {
  const result = await fal.subscribe("fal-ai/gpt-image-1.5", {
    input: {
      prompt,
      image_size: "1024x1024",
      num_images: 1,
    },
  });

  return result.data.images[0].url;
}
```

## Rate Limiting

fal.ai has per-model rate limits. For production:

```ts
async function generateWithRetry(prompt: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fal.subscribe("fal-ai/gpt-image-1.5", {
        input: { prompt },
      });
    } catch (error: any) {
      if (error.status === 429 && i < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
}
```

## Projects Using fal.ai

- **faceplacer** - Face replacement
- **populararchive** - Article illustrations

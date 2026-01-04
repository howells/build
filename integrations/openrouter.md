# OpenRouter Integration

OpenRouter provides access to multiple AI models (Claude, GPT-4, Gemini, Llama, etc.) through a single API, with automatic fallbacks and cost optimization.

## Default Model

**Gemini 2.5 Flash** (`google/gemini-2.5-flash`) is the default for new projects:
- Pricing: $0.30/M input, $2.50/M output
- Context: 1,048,576 tokens (1M)
- Multimodal: text, image, audio, video, file input
- Built-in reasoning/thinking capabilities

Model choice is project-specific—switch based on requirements (coding, reasoning, speed, cost).

## Installation

```bash
pnpm add @openrouter/ai-sdk-provider ai
```

## Basic Setup

### Environment Variables

```bash
OPENROUTER_API_KEY=sk-or-v1-...
```

### Provider Configuration

```ts
// lib/ai.ts
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});
```

## Usage with Vercel AI SDK

### Text Generation

```ts
import { generateText } from "ai";
import { openrouter } from "@/lib/ai";

const { text } = await generateText({
  model: openrouter("google/gemini-2.5-flash"),
  prompt: "Explain quantum computing in simple terms",
});
```

### Streaming

```ts
import { streamText } from "ai";
import { openrouter } from "@/lib/ai";

const result = await streamText({
  model: openrouter("google/gemini-2.5-flash"),
  messages: [
    { role: "user", content: "Write a haiku about programming" }
  ],
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
```

### With Tools

```ts
import { generateText, tool } from "ai";
import { openrouter } from "@/lib/ai";
import { z } from "zod";

const { text, toolCalls } = await generateText({
  model: openrouter("google/gemini-2.5-flash"),
  tools: {
    weather: tool({
      description: "Get the current weather",
      parameters: z.object({
        location: z.string(),
      }),
      execute: async ({ location }) => {
        return { temperature: 72, conditions: "sunny" };
      },
    }),
  },
  prompt: "What's the weather in San Francisco?",
});
```

## Next.js API Route Example

```ts
// app/api/chat/route.ts
import { streamText } from "ai";
import { openrouter } from "@/lib/ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openrouter("google/gemini-2.5-flash"),
    messages,
  });

  return result.toDataStreamResponse();
}
```

## React Hook Usage

```tsx
"use client";

import { useChat } from "ai/react";

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
  });

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>
          <strong>{m.role}:</strong> {m.content}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

## Cost Optimization

OpenRouter automatically routes to the cheapest available model that matches your requirements. You can also set budget limits:

```ts
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "https://yoursite.com",
    "X-Title": "Your App Name",
  },
});
```

## Fallback Models

OpenRouter handles fallbacks automatically, but you can specify preferences:

```ts
// Will try Gemini first, then fall back to Claude
const result = await generateText({
  model: openrouter("google/gemini-2.5-flash", {
    fallbacks: ["anthropic/claude-sonnet-4"],
  }),
  prompt: "Hello",
});
```

## Projects Using OpenRouter

- **reccs** - AI-powered recommendations
- **scenes** - Film/book discovery with AI
- **throughline** - AI writing assistant
- **populararchive** - Content transformation

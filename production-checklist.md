# Production Checklist

Everything needed to launch a Next.js app to production. Use this as a checklist before each deployment.

## Quick Reference

| Category | Files to Create/Check |
|----------|----------------------|
| SEO | `sitemap.ts`, `robots.ts`, `manifest.ts` |
| Metadata | `layout.tsx` (OpenGraph, Twitter, JSON-LD) |
| Assets | `favicon.ico`, `icon.svg`, `apple-touch-icon.png`, `og-image.png` |
| Feeds | `feed.xml/route.ts` |
| Analytics | PostHog provider, env vars |
| Deployment | `vercel.json`, env vars in dashboard |

---

## 1. Favicons & App Icons

### Required Files

Place in `app/` directory (App Router serves them automatically):

```
app/
├── favicon.ico          # 32x32 ICO (legacy browsers)
├── icon.svg             # Scalable favicon (modern browsers)
├── icon.png             # 512x512 PNG fallback
├── apple-touch-icon.png # 180x180 PNG (iOS home screen)
└── og-image.png         # 1200x630 PNG (social sharing default)
```

### Web App Manifest

```ts
// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "App Name",
    short_name: "App",
    description: "App description",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}
```

### Icon Generation

Use a single SVG source and generate all sizes:

```bash
# From SVG to required formats (using ImageMagick)
convert icon.svg -resize 32x32 favicon.ico
convert icon.svg -resize 180x180 apple-touch-icon.png
convert icon.svg -resize 512x512 icon.png
```

Or use [RealFaviconGenerator](https://realfavicongenerator.net/) for comprehensive icon sets.

---

## 2. Metadata & OpenGraph

### Root Layout Metadata

```tsx
// app/layout.tsx
import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Site Name",
    template: "%s | Site Name",
  },
  description: "Site description for search engines",
  keywords: ["keyword1", "keyword2"],
  authors: [{ name: "Author Name" }],
  creator: "Creator Name",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Site Name",
    title: "Site Name",
    description: "Site description for social sharing",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Site Name",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Site Name",
    description: "Site description for Twitter",
    images: ["/og-image.png"],
    creator: "@twitterhandle",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: baseUrl,
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};
```

### Dynamic Page Metadata

```tsx
// app/[slug]/page.tsx
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getItemBySlug(slug);

  if (!item) return {};

  return {
    title: item.title,
    description: item.description.slice(0, 160),
    openGraph: {
      title: item.title,
      description: item.description.slice(0, 160),
      url: `/item/${slug}`,
      images: item.image ? [{ url: item.image }] : [],
    },
  };
}
```

---

## 3. JSON-LD Structured Data

JSON-LD is injected as a script tag in the document. Since the content is generated server-side from trusted database values (not user input), this is safe.

### Helper Component

```tsx
// components/json-ld.tsx
interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // Safe: content is server-generated from trusted database values
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

### Organization Schema (Root Layout)

```tsx
// app/layout.tsx
import { JsonLd } from "@/components/json-ld";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Company Name",
    url: "https://example.com",
    logo: "https://example.com/logo.png",
    sameAs: [
      "https://twitter.com/handle",
      "https://github.com/handle",
    ],
  };

  return (
    <html lang="en">
      <head>
        <JsonLd data={organizationData} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Article Schema (Blog Posts)

```tsx
// app/blog/[slug]/page.tsx
import { JsonLd } from "@/components/json-ld";

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "Site Name",
      logo: {
        "@type": "ImageObject",
        url: "https://example.com/logo.png",
      },
    },
  };

  return (
    <>
      <JsonLd data={articleData} />
      <article>{/* content */}</article>
    </>
  );
}
```

### Product Schema (E-commerce)

```tsx
const productData = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,
  description: product.description,
  image: product.images,
  offers: {
    "@type": "Offer",
    price: product.price,
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
};
```

### BreadcrumbList Schema

```tsx
const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://example.com" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://example.com/blog" },
    { "@type": "ListItem", position: 3, name: post.title },
  ],
};
```

---

## 4. Sitemap & Robots

### Dynamic Sitemap

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";
import { db } from "@/db";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // Dynamic pages from database
  const items = await db.query.items.findMany({
    columns: { slug: true, updatedAt: true },
  });

  const dynamicPages: MetadataRoute.Sitemap = items.map((item) => ({
    url: `${baseUrl}/item/${item.slug}`,
    lastModified: item.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...dynamicPages];
}
```

### Robots.txt

```ts
// app/robots.ts
import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/private/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

---

## 5. RSS Feed

```ts
// app/feed.xml/route.ts
import { db } from "@/db";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";

export async function GET() {
  const items = await db.query.items.findMany({
    orderBy: (items, { desc }) => [desc(items.createdAt)],
    limit: 20,
  });

  const escapeXml = (text: string) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Site Name</title>
    <link>${baseUrl}</link>
    <description>Site description</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items
      .map(
        (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${baseUrl}/item/${item.slug}</link>
      <guid isPermaLink="true">${baseUrl}/item/${item.slug}</guid>
      <pubDate>${new Date(item.createdAt).toUTCString()}</pubDate>
      <description>${escapeXml(item.description)}</description>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
```

Add RSS discovery to layout metadata:

```tsx
// In metadata alternates
alternates: {
  types: {
    "application/rss+xml": "/feed.xml",
  },
},
```

---

## 6. Analytics (PostHog)

### Installation

```bash
pnpm add posthog-js
```

### Provider Setup

```tsx
// app/providers.tsx
"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        person_profiles: "identified_only",
        capture_pageview: false, // We'll capture manually for SPA
        capture_pageleave: true,
      });
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
```

### Page View Tracking

```tsx
// components/posthog-pageview.tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { useEffect } from "react";

export function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams]);

  return null;
}
```

### Environment Variables

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### User Identification

```tsx
// After successful auth
import posthog from "posthog-js";

posthog.identify(user.id, {
  email: user.email,
  name: user.name,
});

// On logout
posthog.reset();
```

---

## 7. Error Tracking (Sentry)

### Installation

```bash
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Configuration

The wizard creates necessary files. Key settings in `sentry.client.config.ts`:

```ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

---

## 8. Vercel Configuration

### vercel.json

```json
{
  "crons": [
    {
      "path": "/api/cron/daily",
      "schedule": "0 7 * * *"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Cron Security

```ts
// app/api/cron/daily/route.ts
export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Cron logic here
  return Response.json({ success: true });
}
```

---

## 9. Environment Variables

### Required for Production

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_BASE_URL` | Canonical site URL |
| `CRON_SECRET` | Vercel cron authentication |

### Analytics & Monitoring

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog API host |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking |
| `SENTRY_AUTH_TOKEN` | Sentry source maps |

### Third-Party Services

| Variable | Purpose |
|----------|---------|
| `OPENROUTER_API_KEY` | AI model access |
| `FAL_KEY` | Image generation |
| `VOYAGE_API_KEY` | Embeddings |
| `CLERK_SECRET_KEY` | Auth (server) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Auth (client) |

---

## 10. Pre-Launch Checklist

### SEO & Discovery

- [ ] `favicon.ico` exists and displays correctly
- [ ] `apple-touch-icon.png` exists (180x180)
- [ ] `og-image.png` exists (1200x630)
- [ ] `manifest.ts` configured for PWA
- [ ] `sitemap.ts` includes all public pages
- [ ] `robots.ts` allows crawling, blocks private routes
- [ ] Root metadata has title, description, OpenGraph
- [ ] Dynamic pages have unique metadata
- [ ] JSON-LD on key pages (Organization, Article, Product)
- [ ] RSS feed validates at `/feed.xml`
- [ ] Canonical URLs set correctly

### Performance

- [ ] Images use `next/image` with proper sizing
- [ ] Fonts use `next/font` (no layout shift)
- [ ] Above-fold images have `priority`
- [ ] Lighthouse score > 90 (Performance, SEO, Accessibility)
- [ ] Core Web Vitals pass (LCP < 2.5s, FID < 100ms, CLS < 0.1)

### Security

- [ ] Security headers configured
- [ ] No secrets in client-side code
- [ ] CRON_SECRET set for cron endpoints
- [ ] CSP headers if applicable
- [ ] Rate limiting on API routes

### Analytics & Monitoring

- [ ] PostHog initialized and tracking pageviews
- [ ] User identification on auth
- [ ] Sentry configured for error tracking
- [ ] Source maps uploaded to Sentry

### Deployment

- [ ] All environment variables set in Vercel
- [ ] Production database connected
- [ ] Domain configured with SSL
- [ ] Cron jobs scheduled in vercel.json
- [ ] Preview deployments working

### Testing

- [ ] E2E tests pass in CI
- [ ] Critical user flows tested
- [ ] Mobile responsive verified
- [ ] Cross-browser tested (Chrome, Safari, Firefox)

---

## Tools & Validators

| Tool | URL | Purpose |
|------|-----|---------|
| Google Rich Results | https://search.google.com/test/rich-results | JSON-LD validation |
| Facebook Sharing Debugger | https://developers.facebook.com/tools/debug/ | OpenGraph preview |
| Twitter Card Validator | https://cards-dev.twitter.com/validator | Twitter preview |
| Lighthouse | Chrome DevTools | Performance audit |
| W3C Feed Validator | https://validator.w3.org/feed/ | RSS validation |
| RealFaviconGenerator | https://realfavicongenerator.net/ | Favicon generation |

# UploadThing

UploadThing provides simple, type-safe file uploads for Next.js with built-in CDN hosting.

## Installation

```bash
pnpm add uploadthing @uploadthing/react
```

## Environment Variables

```bash
UPLOADTHING_TOKEN=...
```

Get your token from [uploadthing.com](https://uploadthing.com).

## Server Setup

### File Router

```ts
// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  // Image uploader with auth
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 4 } })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for user:", metadata.userId);
      console.log("File URL:", file.url);
      return { uploadedBy: metadata.userId };
    }),

  // PDF uploader
  pdfUploader: f({ pdf: { maxFileSize: "16MB" } })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),

  // Any file type
  fileUploader: f(["image", "pdf", "text"])
    .middleware(async () => ({ userId: "anon" }))
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
```

### Route Handler

```ts
// app/api/uploadthing/route.ts
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
```

## Client Setup

### Generate Components

```ts
// lib/uploadthing.ts
import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();
```

## Usage

### Upload Button

```tsx
"use client";

import { UploadButton } from "@/lib/uploadthing";

export function ImageUpload() {
  return (
    <UploadButton
      endpoint="imageUploader"
      onClientUploadComplete={(res) => {
        console.log("Files:", res);
        const urls = res.map((file) => file.url);
        // Handle uploaded URLs
      }}
      onUploadError={(error) => {
        console.error("Error:", error);
      }}
    />
  );
}
```

### Upload Dropzone

```tsx
"use client";

import { UploadDropzone } from "@/lib/uploadthing";

export function FileDropzone() {
  return (
    <UploadDropzone
      endpoint="fileUploader"
      onClientUploadComplete={(res) => {
        console.log("Uploaded:", res);
      }}
      onUploadError={(error) => {
        console.error("Error:", error);
      }}
      appearance={{
        container: "border-2 border-dashed border-gray-300 rounded-lg p-8",
        uploadIcon: "text-gray-400",
        label: "text-gray-600",
        allowedContent: "text-gray-400 text-sm",
      }}
    />
  );
}
```

### Programmatic Upload

```tsx
"use client";

import { useUploadThing } from "@/lib/uploadthing";

export function CustomUpload() {
  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      console.log("Uploaded:", res);
    },
    onUploadError: (error) => {
      console.error("Error:", error);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const result = await startUpload(Array.from(files));
    console.log("Result:", result);
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        disabled={isUploading}
        multiple
      />
      {isUploading && <p>Uploading...</p>}
    </div>
  );
}
```

### Upload from Server Action

```ts
// lib/uploadthing-server.ts
import { UTApi } from "uploadthing/server";

export const utapi = new UTApi();
```

```ts
// actions/upload.ts
"use server";

import { utapi } from "@/lib/uploadthing-server";

export async function uploadFromUrl(url: string) {
  const response = await utapi.uploadFilesFromUrl(url);
  return response.data?.url;
}

export async function deleteFile(fileKey: string) {
  await utapi.deleteFiles(fileKey);
}
```

## File Types Reference

```ts
// Common configurations
f({ image: { maxFileSize: "4MB" } })           // Images only
f({ pdf: { maxFileSize: "16MB" } })            // PDFs only
f({ video: { maxFileSize: "256MB" } })         // Videos only
f({ audio: { maxFileSize: "32MB" } })          // Audio only
f({ blob: { maxFileSize: "8MB" } })            // Any file type
f(["image", "pdf"])                            // Multiple types

// With count limits
f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })

// Custom mime types
f({ "image/png": { maxFileSize: "4MB" } })
```

## Styling

### Tailwind CSS

```tsx
<UploadDropzone
  endpoint="imageUploader"
  appearance={{
    container: "mt-4 border-2 border-dashed border-gray-200 rounded-xl",
    uploadIcon: "text-gray-400 w-12 h-12",
    label: "text-gray-600 text-lg font-medium",
    allowedContent: "text-gray-400 text-sm",
    button: "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700",
  }}
/>
```

### Hide Default Button Text

```tsx
<UploadButton
  endpoint="imageUploader"
  content={{
    button: "Upload Image",
    allowedContent: "Images up to 4MB",
  }}
/>
```


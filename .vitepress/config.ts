import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Build",
  description: "Reference for building modern web apps with Next.js, React, and TypeScript",
  
  vite: {
    css: {
      postcss: "./postcss.config.mjs",
    },
  },

  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  ],

  themeConfig: {
    logo: "/logo.svg",

    nav: [
      { text: "Guide", link: "/stack-overview" },
      { text: "Integrations", link: "/integrations/nextjs" },
      { text: "Rules", link: "/rules/" },
    ],

    sidebar: [
      {
        text: "Getting Started",
        items: [
          { text: "Stack Overview", link: "/stack-overview" },
          { text: "Version Requirements", link: "/version-requirements" },
          { text: "New Project", link: "/new-project-checklist" },
          { text: "Production Checklist", link: "/production-checklist" },
          { text: "Project Structure", link: "/project-structure" },
          { text: "Dependencies", link: "/dependencies" },
          { text: "Scripts", link: "/scripts" },
        ],
      },
      {
        text: "Core",
        collapsed: false,
        items: [
          { text: "Next.js", link: "/integrations/nextjs" },
          { text: "TypeScript", link: "/integrations/typescript" },
          { text: "Turborepo", link: "/integrations/turborepo" },
          { text: "React Query", link: "/integrations/react-query" },
          { text: "tRPC", link: "/integrations/trpc" },
        ],
      },
      {
        text: "Styling & UI",
        collapsed: false,
        items: [
          { text: "Tailwind CSS", link: "/integrations/tailwind" },
          { text: "Design System", link: "/integrations/design-system" },
          { text: "UI Components", link: "/integrations/ui-components" },
          { text: "Animation", link: "/integrations/animation" },
        ],
      },
      {
        text: "Data & Auth",
        collapsed: false,
        items: [
          { text: "Drizzle + Neon", link: "/integrations/drizzle-neon" },
          { text: "Clerk Auth", link: "/integrations/clerk-auth" },
          { text: "Env Validation", link: "/integrations/env-validation" },
          { text: "Zustand", link: "/integrations/zustand" },
        ],
      },
      {
        text: "Features",
        collapsed: true,
        items: [
          { text: "Forms", link: "/integrations/forms" },
          { text: "UploadThing", link: "/integrations/uploadthing" },
          { text: "Resend Email", link: "/integrations/resend-email" },
        ],
      },
      {
        text: "AI/ML",
        collapsed: true,
        items: [
          { text: "OpenRouter", link: "/integrations/openrouter" },
          { text: "fal.ai", link: "/integrations/fal-ai" },
          { text: "Voyage Embeddings", link: "/integrations/voyage-embeddings" },
        ],
      },
      {
        text: "Quality",
        collapsed: true,
        items: [
          { text: "Biome + Ultracite", link: "/integrations/biome-ultracite" },
          { text: "Testing", link: "/integrations/testing" },
        ],
      },
      {
        text: "Rules",
        collapsed: false,
        items: [
          { text: "Overview", link: "/rules/" },
          { text: "Ruler Setup", link: "/ruler" },
        ],
      },
      {
        text: "Code Rules",
        collapsed: true,
        items: [
          { text: "Code Style", link: "/rules/code-style" },
          { text: "TypeScript", link: "/rules/typescript" },
          { text: "React", link: "/rules/react" },
          { text: "Next.js", link: "/rules/nextjs" },
          { text: "Tailwind", link: "/rules/tailwind" },
        ],
      },
      {
        text: "Workflow Rules",
        collapsed: true,
        items: [
          { text: "Git", link: "/rules/git" },
          { text: "Testing", link: "/rules/testing" },
          { text: "Environment", link: "/rules/env" },
          { text: "Turborepo", link: "/rules/turborepo" },
          { text: "Integrations", link: "/rules/integrations" },
        ],
      },
      {
        text: "Interface Rules",
        collapsed: true,
        items: [
          { text: "Typography", link: "/rules/interface/typography" },
          { text: "Animation", link: "/rules/interface/animation" },
          { text: "Forms", link: "/rules/interface/forms" },
          { text: "Interactions", link: "/rules/interface/interactions" },
          { text: "Layout", link: "/rules/interface/layout" },
          { text: "Design", link: "/rules/interface/design" },
          { text: "Performance", link: "/rules/interface/performance" },
          { text: "Accessibility", link: "/rules/interface/content-accessibility" },
        ],
      },
    ],

    search: {
      provider: "local",
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/howells/build" },
    ],

    editLink: {
      pattern: "https://github.com/howells/build/edit/main/:path",
      text: "Edit this page",
    },

    footer: {
      message: "A reference for building modern web apps",
      copyright: "Daniel Howells",
    },
  },
});

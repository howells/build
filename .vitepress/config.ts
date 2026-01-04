import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Build",
  description: "Reference for building modern web apps with Next.js, React, and TypeScript",

  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  ],

  themeConfig: {
    logo: "/logo.svg",

    nav: [
      { text: "Guide", link: "/stack-overview" },
      { text: "Integrations", link: "/integrations/clerk-auth" },
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
        text: "Integrations",
        collapsed: false,
        items: [
          { text: "TypeScript", link: "/integrations/typescript" },
          { text: "Tailwind CSS", link: "/integrations/tailwind" },
          { text: "Clerk Auth", link: "/integrations/clerk-auth" },
          { text: "Drizzle + Neon", link: "/integrations/drizzle-neon" },
          { text: "tRPC", link: "/integrations/trpc" },
          { text: "Env Validation", link: "/integrations/env-validation" },
          { text: "Zustand", link: "/integrations/zustand" },
          { text: "Forms", link: "/integrations/forms" },
          { text: "Resend Email", link: "/integrations/resend-email" },
          { text: "OpenRouter", link: "/integrations/openrouter" },
          { text: "fal.ai", link: "/integrations/fal-ai" },
          { text: "Voyage Embeddings", link: "/integrations/voyage-embeddings" },
          { text: "UploadThing", link: "/integrations/uploadthing" },
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

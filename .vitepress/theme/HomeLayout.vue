<script setup lang="ts">
import { useData } from "vitepress";
import SectionHeading from "./SectionHeading.vue";

const { frontmatter } = useData();

const sections = [
  {
    title: "Reference",
    links: [
      { text: "Stack Overview", link: "/stack-overview" },
      { text: "Version Requirements", link: "/version-requirements" },
      { text: "Project Structure", link: "/project-structure" },
      { text: "Dependencies", link: "/dependencies" },
    ],
  },
  {
    title: "Integrations",
    links: [
      { text: "Clerk Auth", link: "/integrations/clerk-auth" },
      { text: "Drizzle + Neon", link: "/integrations/drizzle-neon" },
      { text: "tRPC", link: "/integrations/trpc" },
      { text: "Zustand", link: "/integrations/zustand" },
      { text: "Forms", link: "/integrations/forms" },
      { text: "Resend Email", link: "/integrations/resend-email" },
      { text: "OpenRouter", link: "/integrations/openrouter" },
      { text: "UploadThing", link: "/integrations/uploadthing" },
    ],
  },
  {
    title: "Checklists",
    links: [
      { text: "New Project", link: "/new-project-checklist" },
      { text: "Production Launch", link: "/production-checklist" },
    ],
  },
  {
    title: "Rules",
    links: [
      { text: "Overview", link: "/rules/" },
      { text: "Ruler Setup", link: "/ruler" },
    ],
  },
];
</script>

<template>
  <div class="max-w-[640px] mx-auto px-6 pt-20 pb-[120px] min-h-screen antialiased">
    <header class="mb-12">
      <h1 class="text-[14px] text-zinc-950 mb-1 tracking-tight dark:text-zinc-50">Build</h1>
      <p class="text-zinc-500">How I build software</p>
    </header>

    <main>
      <section class="mb-14">
        <p class="text-zinc-600 dark:text-zinc-400 max-w-[480px]">
          Personal development reference extracted from 15 active projects.
          Patterns, integrations, and conventions I use every day.
        </p>
      </section>

      <nav class="flex flex-col gap-12 mb-20">
        <div v-for="section in sections" :key="section.title">
          <SectionHeading>{{ section.title }}</SectionHeading>
          <ul class="list-none p-0 m-0 grid grid-cols-1 sm:grid-cols-2 gap-x-12">
            <li v-for="link in section.links" :key="link.text">
              <a :href="link.link" class="block text-zinc-600 dark:text-zinc-400 no-underline py-1.5 transition-colors hover:text-zinc-950 dark:hover:text-zinc-50">
                {{ link.text }}
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <footer class="pt-10 border-t border-zinc-200 dark:border-zinc-800">
        <p class="text-zinc-500 mb-2">
          For AI agents:
          <a href="/llms.txt" class="text-zinc-600 dark:text-zinc-400 underline underline-offset-[3px] decoration-zinc-300 dark:decoration-zinc-700 transition-colors hover:decoration-zinc-600 dark:hover:decoration-zinc-400">
            /llms.txt
          </a>
        </p>
        <p class="text-zinc-500">
          Daniel Howells
        </p>
      </footer>
    </main>
  </div>
</template>
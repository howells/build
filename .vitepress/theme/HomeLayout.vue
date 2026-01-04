<script setup lang="ts">
import { useData } from 'vitepress'

const { frontmatter } = useData()
</script>

<template>
  <div class="home">
    <header class="header">
      <h1 class="title">Build</h1>
      <p class="subtitle">How I build software</p>
    </header>

    <main class="content">
      <section class="intro">
        <p>
          Personal development reference extracted from 15 active projects.
          Patterns, integrations, and conventions I use every day.
        </p>
      </section>

      <nav class="toc">
        <div class="toc-section">
          <h2>Reference</h2>
          <ul>
            <li><a href="/stack-overview">Stack Overview</a></li>
            <li><a href="/version-requirements">Version Requirements</a></li>
            <li><a href="/project-structure">Project Structure</a></li>
            <li><a href="/dependencies">Dependencies</a></li>
          </ul>
        </div>

        <div class="toc-section">
          <h2>Integrations</h2>
          <ul>
            <li><a href="/integrations/clerk-auth">Clerk Auth</a></li>
            <li><a href="/integrations/drizzle-neon">Drizzle + Neon</a></li>
            <li><a href="/integrations/trpc">tRPC</a></li>
            <li><a href="/integrations/zustand">Zustand</a></li>
            <li><a href="/integrations/forms">Forms</a></li>
            <li><a href="/integrations/resend-email">Resend Email</a></li>
            <li><a href="/integrations/openrouter">OpenRouter</a></li>
            <li><a href="/integrations/uploadthing">UploadThing</a></li>
          </ul>
        </div>

        <div class="toc-section">
          <h2>Checklists</h2>
          <ul>
            <li><a href="/new-project-checklist">New Project</a></li>
            <li><a href="/production-checklist">Production Launch</a></li>
          </ul>
        </div>

        <div class="toc-section">
          <h2>Rules</h2>
          <ul>
            <li><a href="/rules/">Overview</a></li>
            <li><a href="/ruler">Ruler Setup</a></li>
          </ul>
        </div>
      </nav>

      <footer class="footer">
        <p class="llms">
          For AI agents: <a href="/llms.txt">/llms.txt</a>
        </p>
        <p class="meta">
          Daniel Howells
        </p>
      </footer>
    </main>
  </div>
</template>

<style scoped>
.home {
  max-width: 640px;
  margin: 0 auto;
  padding: 80px 24px 120px;
  min-height: 100vh;
}

.header {
  margin-bottom: 48px;
}

.title {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  margin: 0 0 4px;
  letter-spacing: -0.01em;
}

.subtitle {
  font-size: 14px;
  font-weight: 400;
  color: var(--vp-c-text-3);
  margin: 0;
}

.intro {
  margin-bottom: 56px;
}

.intro p {
  font-size: 14px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
  margin: 0;
  max-width: 480px;
}

.toc {
  display: flex;
  flex-direction: column;
  gap: 48px;
  margin-bottom: 80px;
}

.toc-section h2 {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-3);
  margin: 0 0 12px;
}

.toc-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 48px;
}

@media (max-width: 480px) {
  .toc-section ul {
    grid-template-columns: 1fr;
  }
}

.toc-section li {
  margin: 0;
}

.toc-section a {
  display: block;
  font-size: 14px;
  color: var(--vp-c-text-2);
  text-decoration: none;
  padding: 6px 0;
  transition: color 0.15s;
}

.toc-section a:hover {
  color: var(--vp-c-text-1);
}

.footer {
  padding-top: 40px;
  border-top: 1px solid var(--vp-c-divider-light);
}

.llms {
  font-size: 13px;
  color: var(--vp-c-text-3);
  margin: 0 0 8px;
}

.llms a {
  color: var(--vp-c-text-2);
  text-decoration: underline;
  text-decoration-color: var(--vp-c-divider);
  text-underline-offset: 3px;
  transition: text-decoration-color 0.15s;
}

.llms a:hover {
  text-decoration-color: var(--vp-c-text-2);
}

.meta {
  font-size: 13px;
  color: var(--vp-c-text-3);
  margin: 0;
}
</style>

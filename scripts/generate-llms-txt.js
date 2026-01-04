import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();
const OUTPUT = join(ROOT, "public", "llms.txt");

// Files to include, in order
const STRUCTURE = [
  // Core docs
  "stack-overview.md",
  "version-requirements.md",
  "new-project-checklist.md",
  "production-checklist.md",
  "project-structure.md",
  "dependencies.md",
  "scripts.md",
  "ruler.md",
  // Integrations
  "integrations/clerk-auth.md",
  "integrations/drizzle-neon.md",
  "integrations/trpc.md",
  "integrations/env-validation.md",
  "integrations/zustand.md",
  "integrations/forms.md",
  "integrations/resend-email.md",
  "integrations/openrouter.md",
  "integrations/fal-ai.md",
  "integrations/voyage-embeddings.md",
  "integrations/uploadthing.md",
  "integrations/biome-ultracite.md",
  // Rules
  "rules/code-style.md",
  "rules/typescript.md",
  "rules/react.md",
  "rules/nextjs.md",
  "rules/tailwind.md",
  "rules/git.md",
  "rules/testing.md",
  "rules/env.md",
  "rules/turborepo.md",
  "rules/integrations.md",
  // Interface rules
  "rules/interface/typography.md",
  "rules/interface/animation.md",
  "rules/interface/forms.md",
  "rules/interface/interactions.md",
  "rules/interface/layout.md",
  "rules/interface/design.md",
  "rules/interface/performance.md",
  "rules/interface/content-accessibility.md",
];

async function generate() {
  const header = `# Build — Stack Reference
> How Daniel Howells builds software. Personal development reference distilled from 15 active projects.
> Source: https://github.com/howells/docs
> Website: https://build.danielhowells.com

## Table of Contents

${STRUCTURE.map((f) => `- ${f}`).join("\n")}

---

`;

  const sections = [];

  for (const file of STRUCTURE) {
    const path = join(ROOT, file);
    try {
      const content = await readFile(path, "utf-8");
      sections.push(`\n\n${"=".repeat(80)}\n## ${file}\n${"=".repeat(80)}\n\n${content}`);
    } catch {
      console.warn(`Warning: ${file} not found, skipping`);
    }
  }

  const output = header + sections.join("");

  await writeFile(OUTPUT, output, "utf-8");
  console.log(`Generated ${OUTPUT} (${(output.length / 1024).toFixed(1)} KB)`);
}

generate().catch(console.error);

<required_reading>
**Read this reference file NOW:**
- references/new-project-checklist.md
</required_reading>

<process>
## Step 1: Decide Project Type

Ask the user:
"Monorepo or single app?"

| Choice | When to use |
|--------|-------------|
| Single app | Fast prototype, simple domain, solo/small team |
| Monorepo | Long-term project, code sharing needed, larger team |

## Step 2: Bootstrap

**Recommended: Better-T-Stack CLI**
```bash
bun create better-t-stack@latest project-name
```

Interactive prompts guide you through options. For Daniel's standard stack, select:
- Frontend: Next.js
- Backend: Next.js API Routes (or Hono for standalone)
- Database: PostgreSQL + Drizzle + Neon
- Auth: Better-Auth (or skip if using Clerk)
- API: tRPC
- Addons: Turborepo, Biome, Ultracite

See [better-t-stack.dev/new](https://www.better-t-stack.dev/new) for the visual builder.

**Alternative: Plain Next.js (simple projects)**
```bash
pnpm create next-app@latest project-name --typescript --tailwind --app --src-dir --import-alias "@/*"
cd project-name
```

## Step 3: Install Dependencies

Follow the dependency installation from `references/new-project-checklist.md`.

Key packages:
- Styling: tailwind-merge, cva, clsx, tw-animate-css
- Database: drizzle-orm, @neondatabase/serverless
- Auth: @clerk/nextjs
- Data: @tanstack/react-query, zod
- UI: @base-ui/react, lucide-react
- Quality: @biomejs/biome, ultracite, husky, lint-staged

## Step 4: Configure Tooling

1. **Biome**: `pnpm exec ultracite init`
2. **Pre-commit hooks**: husky + lint-staged
3. **Tailwind v4**: PostCSS config + CSS-based configuration
4. **Drizzle**: drizzle.config.ts

## Step 5: Create CLAUDE.md

Generate project rules file based on the template in `references/new-project-checklist.md`.

## Step 6: Verify

Run the verification checklist:
- [ ] `pnpm dev` starts without errors
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Pre-commit hooks work
- [ ] Database connection works
- [ ] CLAUDE.md created
</process>

<success_criteria>
Project is ready when:
- [ ] All dependencies installed
- [ ] Biome configured
- [ ] Pre-commit hooks working
- [ ] Tailwind v4 configured
- [ ] Database connected
- [ ] CLAUDE.md in place
- [ ] Dev server runs cleanly
</success_criteria>

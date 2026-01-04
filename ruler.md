# Ruler - Code Rules for AI Agents

Ruler is a tool for managing code rules that get injected into AI agent context files (CLAUDE.md, .cursorrules, etc.). It provides a single source of truth for project conventions.

## What Ruler Does

1. **Aggregates rules** from `.ruler/*.md` files
2. **Generates agent files** (CLAUDE.md, .cursorrules, AGENTS.md, etc.)
3. **Manages MCP servers** via `ruler.toml` config
4. **Supports nested rules** for monorepos

## Installation

```bash
# Global install
npm install -g @intellectronica/ruler

# Or use npx
npx @intellectronica/ruler apply
```

## Quick Start

```bash
# Initialize a new .ruler directory
mkdir .ruler
touch .ruler/ruler.toml

# Create your first rule file
cat > .ruler/code-style.md << 'EOF'
# Code Style

- MUST: Use double quotes for strings
- MUST: Include semicolons
- SHOULD: Prefer template literals over concatenation
EOF

# Apply rules to generate agent files
npx ruler apply
```

## Directory Structure

```
project/
├── .ruler/
│   ├── ruler.toml           # Configuration
│   ├── agents.md             # Rule directory/index
│   ├── code-style.md         # Formatting rules
│   ├── typescript.md         # TypeScript rules
│   ├── react.md              # React rules
│   ├── nextjs.md             # Next.js rules
│   ├── tailwind.md           # Tailwind rules
│   ├── testing.md            # Testing rules
│   ├── git.md                # Git workflow
│   ├── env.md                # Environment rules
│   ├── turborepo.md          # Monorepo rules
│   ├── integrations.md       # External services
│   └── interface/            # UI/UX guidelines
│       ├── animation.md
│       ├── forms.md
│       ├── interactions.md
│       ├── layout.md
│       ├── design.md
│       ├── performance.md
│       └── content-accessibility.md
├── CLAUDE.md                 # Generated (Claude Code)
├── .cursorrules              # Generated (Cursor)
└── AGENTS.md                 # Generated (other agents)
```

## Configuration (ruler.toml)

```toml
# Ruler Configuration File
# See https://ai.intellectronica.net/ruler for documentation.

# Which agents to generate files for by default
default_agents = ["cursor", "claude", "codex"]

# Enable nested rule loading from nested .ruler directories
# nested = false

# --- MCP Configuration ---
[mcp]
enabled = true
merge_strategy = "merge"

# --- Agent Configurations ---
# Customize output paths per agent

[agents.claude]
enabled = true
# output_path = "CLAUDE.md"  # default

[agents.cursor]
enabled = true
# output_path = ".cursorrules"  # default

[agents.copilot]
enabled = true
output_path = ".github/copilot-instructions.md"

# --- MCP Servers ---
# Define MCP servers for agent tools

[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]

[mcp_servers.neon]
url = "https://mcp.neon.tech/mcp"
headers = { Authorization = "Bearer ${NEON_API_KEY}" }

[mcp_servers.fal]
url = "https://docs.fal.ai/mcp"
```

## Commands

```bash
# Apply rules (generate agent files)
npx ruler apply

# Apply with specific agents only
npx ruler apply --agents cursor,claude

# Apply without backups
npx ruler apply --backup=false

# Apply in nested mode (monorepos)
npx ruler apply --nested

# Revert generated files
npx ruler revert

# Revert without keeping backups
npx ruler revert --keep-backups=false
```

## Writing Rules

Rules use RFC 2119 terms for clarity:

| Term | Meaning |
|------|---------|
| **MUST** | Absolute requirement |
| **MUST NOT** | Absolute prohibition |
| **SHOULD** | Recommended, but exceptions allowed |
| **SHOULD NOT** | Not recommended, but not prohibited |
| **NEVER** | Strong prohibition (alias for MUST NOT) |

### Example Rule File

```markdown
# TypeScript Rules

## Type Definitions
- MUST: Use `interface` over `type` for object definitions.
- MUST: Use `type` for unions, mapped types, and conditionals.
- MUST: Use `import type` for type-only imports.

## Type Safety
- NEVER: Use `any`. Prefer `unknown` with narrowing.
- NEVER: Use non-null assertions (`!`).
- NEVER: Cast with `as any` or `as unknown as`.

## Simplicity
- SHOULD: Inline types when they're only used once.
- SHOULD: Avoid unnecessary abstractions.
```

## Package.json Scripts

```json
{
  "scripts": {
    "rules:apply": "ruler apply --backup=false --nested",
    "rules:clean": "ruler revert --keep-backups=false"
  }
}
```

## Monorepo Usage

For monorepos, you can have:
- Root `.ruler/` for shared rules
- Package-specific `.ruler/` for overrides

Enable nested mode:

```toml
# ruler.toml
nested = true
```

Then run:

```bash
npx ruler apply --nested
```

## Integration with Husky

Add ruler to your pre-commit hook:

```bash
# .husky/pre-commit
pnpm rules:apply
git add CLAUDE.md .cursorrules AGENTS.md
```

## Complete Ruleset

See the `rules/` directory in this documentation for a complete, copy-paste-ready ruleset based on the materia project:

- [rules/README.md](./rules/README.md) - Rule directory index
- [rules/code-style.md](./rules/code-style.md) - Formatting and syntax
- [rules/typescript.md](./rules/typescript.md) - TypeScript conventions
- [rules/react.md](./rules/react.md) - React component patterns
- [rules/nextjs.md](./rules/nextjs.md) - Next.js App Router rules
- [rules/tailwind.md](./rules/tailwind.md) - Tailwind v4 configuration
- [rules/testing.md](./rules/testing.md) - Testing requirements
- [rules/git.md](./rules/git.md) - Git workflow
- [rules/env.md](./rules/env.md) - Environment variable handling
- [rules/turborepo.md](./rules/turborepo.md) - Monorepo patterns
- [rules/integrations.md](./rules/integrations.md) - External service rules
- [rules/interface/](./rules/interface/) - UI/UX guidelines

## Why Ruler?

1. **Single source of truth** - Rules live in `.ruler/`, not scattered across agent files
2. **Multi-agent support** - One ruleset, multiple agent file formats
3. **Version controlled** - Rules are markdown, easy to review and diff
4. **MCP integration** - Manage MCP server configs alongside rules
5. **Monorepo friendly** - Nested rules with inheritance

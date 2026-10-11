# epifolio

A personal recipe book that doubles as a restaurant menu with a distinctive, animated interface. Built for local, single-user use.

## Features

- Record recipes: ingredients, steps, reference links and images.
- Arrange recipes into your own restaurant menu, then browse and edit it like a book.
- Planned: export menus to PDF and switch between menu themes.

## Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn (Base UI) + next-themes
- motion for UI animation
- react-hook-form + zod
- Prisma 7 + SQLite

## Getting started

Requires Node.js 22+ and pnpm 8.

```bash
cp .env.example .env
pnpm install                  # also runs prisma generate
pnpm exec prisma migrate dev
pnpm dev
```

## Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `pnpm dev`          | Start the dev server                 |
| `pnpm build`        | Production build                     |
| `pnpm lint`         | Run ESLint                           |
| `pnpm typecheck`    | Generate route types and run tsc     |
| `pnpm format`       | Format with Prettier                 |
| `pnpm format:check` | Check formatting                     |
| `pnpm docs:serve`   | Preview the docs site locally        |
| `pnpm docs:build`   | Build the docs site in strict mode   |

## Environment variables

| Variable       | Description                                          |
| -------------- | ---------------------------------------------------- |
| `DATABASE_URL` | SQLite database file, defaults to `file:./prisma/dev.db` |

## Documentation

Project documentation lives in `docs/` (written in Traditional Chinese) and is previewed locally with MkDocs Material:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements-docs.txt
pnpm docs:serve
```

- Current status: `docs/STATUS.md`
- Architecture and decisions: `docs/architecture.md`, `docs/adr/`
- Rules for AI collaborators: `CLAUDE.md`
- Tasks and roadmap: GitHub Issues

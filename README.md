# Epifolio

A page-flipping personal menu and recipe book.

## Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn (Base UI) + next-themes
- motion for page-flip animation
- react-hook-form + zod
- Prisma 7 + SQLite

## Getting started

```bash
cp .env.example .env
pnpm install          # also runs prisma generate
pnpm exec prisma migrate dev
pnpm dev
```

## Scripts

| Command             | Description                 |
| ------------------- | --------------------------- |
| `pnpm dev`          | Start the dev server        |
| `pnpm build`        | Production build            |
| `pnpm lint`         | ESLint                      |
| `pnpm format`       | Format with Prettier        |
| `pnpm format:check` | Check formatting            |

# Bryggverket

Website for [Bryggverket](https://bryggverket.se), a brewery in Umeå, Sweden.

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Sanity v3** — headless CMS ([studio](./sanity/))
- **Motion** — scroll-driven animations
- **SCSS** — global styles
- **Biome** — linting and formatting

## Prerequisites

- Node.js >= 24.14.0

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run Biome linter |
| `npm run format` | Auto-fix lint and formatting |
| `npm run check` | Lint + build (CI check) |

## Sanity Studio

The CMS studio lives in [`sanity/`](./sanity/) and is a separate project with its own dependencies.

```bash
cd sanity
npm install
npm run dev
```

## Deployment

Deployed to Vercel. CI runs lint and build on every PR via GitHub Actions.

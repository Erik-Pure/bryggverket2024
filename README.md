# Bryggverket

Website for [Bryggverket](https://bryggverket.se), a brewery in Umeå, Sweden.

## Tech stack

- **Astro 5** — static site with React islands
- **React 19** — interactive components (scroll animations, age gate)
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

Open [http://localhost:4321](http://localhost:4321).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run Biome linter |
| `npm run format` | Auto-fix lint and formatting |
| `npm run check` | Type check + lint + build (CI) |

## Sanity Studio

The CMS studio lives in [`sanity/`](./sanity/) and is a separate project with its own dependencies.

```bash
cd sanity
npm install
npm run dev
```

## Deployment

Deployed to Vercel. CI runs type check, lint, and build on every PR via GitHub Actions.

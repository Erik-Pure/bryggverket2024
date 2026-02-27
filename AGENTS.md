# AGENTS.md

## Project

Bryggverket — marketing site for a Swedish craft brewery. Static site built with Astro, content from Sanity CMS, interactive bits via React islands.

## Tech Stack

- **Framework**: Astro 5 (static output, file-based routing)
- **UI islands**: React 19 (only for interactive components)
- **CMS**: Sanity (`@sanity/astro`, project `b0e19xpn`, dataset `production`)
- **Styling**: SCSS (`src/styles/globals.scss`), scoped `<style>` in `.astro` files
- **Fonts**: Fontsource (Saira, Permanent Marker) — no external font loading
- **Animations**: Motion (Framer Motion) for scroll-driven effects
- **Linting/Formatting**: Biome (single quotes, no semicolons, space indent)
- **Testing**: Vitest (unit/component), Playwright (visual regression)
- **Hosting**: Vercel (static)

## Directory Structure

```
src/
  pages/          # Astro pages — file-based routing
  layouts/        # Layout.astro — wraps all pages
  components/     # .astro = static, .tsx = React islands
  lib/            # sanity.ts (client + urlFor), interface.ts (types)
  styles/         # globals.scss
tests/            # Vitest unit/component tests + Playwright visual tests
sanity/           # Sanity Studio (separate package in same repo)
  schemaTypes/    # Content models
```

## Key Conventions

### Astro vs React components

- Default to `.astro` components — they render at build time with zero JS.
- Use `.tsx` (React) only when the component needs client-side interactivity (animations, state, event handlers).
- React components must be hydrated with a `client:*` directive in the parent `.astro` file:
  - `client:load` — hydrate immediately (age gates, nav)
  - `client:visible` — hydrate when scrolled into view (preferred for below-fold content)
  - `client:idle` — hydrate when browser is idle
- Never import `.astro` components from `.tsx` files (only the other way around).

### Data fetching

- All Sanity queries run in `.astro` frontmatter (build time). Never fetch in React components.
- Use `sanityClient` from `sanity:client` (virtual module from `@sanity/astro`).
- Use `urlFor()` from `src/lib/sanity.ts` for image URLs.
- Dynamic routes use `getStaticPaths()` — see `src/pages/beverages/[slug].astro`.

### Rich text

- In `.astro` files: use `astro-portabletext` (`<PortableText>` component).
- In `.tsx` files: use `@portabletext/react`.

### Styling

- Global styles live in `src/styles/globals.scss` (imported in Layout.astro).
- Font classes: `.font-saira`, `.font-marker` (defined in globals).
- Scoped styles in `.astro` files use `<style lang="scss">`.
- No CSS-in-JS. No Tailwind (SCSS only).

### Images

- Plain `<img>` tags with `urlFor()` for Sanity images. No image optimization framework.
- Always include `alt`, `width`, `height`, and `loading="lazy"` where appropriate.

## Linting & Formatting

Biome handles both. Config in `biome.json`.

- `.astro` files are excluded from Biome (Astro has its own checker via `astro check`).
- Run `npm run format` before committing.
- Run `npm run check` to validate everything (astro check + biome + build).

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Biome lint check |
| `npm run format` | Biome auto-fix + format |
| `npm run test` | Run Vitest tests once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run check` | Full validation (types + lint + tests + build) |

## Sanity Studio

The `sanity/` directory is a separate package with its own `package.json`. Schema types define the CMS content models. Changes there affect what data is available to the site but don't require site code changes unless you add/remove fields.

## Workflow Rules

- **Never** commit, push, or create PRs/branches on remote without explicit confirmation from the user.
- Run `npm run format` before committing.
- Run `npm run check` to validate (types + lint + tests + build).

## Gotchas

- `sanity:client` is a virtual module — TypeScript needs `src/env.d.ts` with `/// <reference types="@sanity/astro/module" />`.
- React islands are wrapped in `<astro-island>` in the DOM. CSS that assumes a direct parent-child relationship may break — use global classes or adjust selectors.
- The AgeGate component uses `document.cookie` directly (with a biome-ignore comment) because Cookie Store API support is limited.

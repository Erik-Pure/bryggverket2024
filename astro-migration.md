# Astro Migration Guide

This document explains the migration from Next.js 16 to Astro 5 for the Bryggverket website. It's aimed at developers familiar with Next.js but new to Astro.

## Why Astro?

Bryggverket is a content-driven marketing site — a handful of pages serving CMS content with a few interactive animations. Next.js ships a full React runtime to every page for hydration, even when most of the page is static HTML. Astro's architecture is built for exactly this kind of site:

- **Zero JS by default.** Pages render to static HTML. JavaScript is only shipped for components that need interactivity.
- **React islands.** Interactive components (scroll animations, age gate) stay as React components, hydrated only when needed.
- **Faster page loads.** Static pages like `/about`, `/book`, and `/beverages` ship zero JavaScript to the browser.

## Architecture Overview

```
src/
├── components/         # Both .astro (static) and .tsx (React islands)
├── layouts/
│   └── Layout.astro    # Replaces layout.tsx — header, footer, global styles
├── lib/
│   ├── interface.ts    # TypeScript interfaces (unchanged)
│   └── sanity.ts       # urlFor() helper using @sanity/astro
├── pages/              # File-based routing (like Next.js App Router)
│   ├── index.astro
│   ├── about.astro
│   ├── book.astro
│   └── beverages/
│       ├── index.astro
│       └── [slug].astro
└── styles/
    └── globals.scss    # Global styles (moved from src/app/)
```

## Key Concepts for Next.js Developers

### Astro Components (.astro files)

Astro components have a "frontmatter" section (between `---` fences) for server-side logic and a template section below. Think of the frontmatter as an async server component and the template as JSX — but it renders to static HTML with no client-side hydration.

```astro
---
// This runs at build time (like a Next.js server component)
import { sanityClient } from "sanity:client";
const data = await sanityClient.fetch(`*[_type == 'about'][0]`);
---

<!-- This renders to static HTML — no React runtime shipped -->
<h1>{data.title}</h1>
```

### React Islands (client directives)

Interactive components stay as `.tsx` files and get a `client:*` directive in the template to control when they hydrate:

```astro
---
import LandingHero from "@/components/LandingHero";
---

<!-- Hydrates immediately on page load -->
<LandingHero client:load title={data.title} />

<!-- Hydrates when the element enters the viewport -->
<BeerOverview client:visible title={data.drinkTitle} />

<!-- Hydrates when the browser is idle -->
<AgeGate client:idle />
```

| Directive | When it hydrates | Used for |
|-----------|-----------------|----------|
| `client:load` | Immediately | Above-the-fold interactive content (LandingHero, BeerHero) |
| `client:visible` | Enters viewport | Below-the-fold animations (BeerOverview, EventOverview, MerchOverview) |
| `client:idle` | Browser idle | Non-urgent interactivity (AgeGate) |

### Data Fetching

In Next.js, you used async server components with `client.fetch()`. In Astro, data fetching happens in the frontmatter of `.astro` files — same concept, different syntax:

**Next.js:**
```tsx
export const revalidate = 300;
async function getData() {
  return await client.fetch(query);
}
export default async function Page() {
  const data = await getData();
  return <h1>{data.title}</h1>;
}
```

**Astro:**
```astro
---
import { sanityClient } from "sanity:client";
const data = await sanityClient.fetch(query);
---
<h1>{data.title}</h1>
```

The `revalidate = 300` (ISR) is no longer needed — pages are fully static and rebuilt when content changes (via Sanity webhook or manual deploy).

### Static Paths (Dynamic Routes)

Next.js dynamic routes like `[slug]/page.tsx` with `params` become Astro's `getStaticPaths`:

**Next.js:**
```tsx
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await client.fetch(query, { slug });
  // ...
}
```

**Astro:**
```astro
---
export async function getStaticPaths() {
  const items = await sanityClient.fetch(`*[_type == 'beverage'] { "slug": slug.current }`);
  return items.map((b) => ({ params: { slug: b.slug } }));
}
const { slug } = Astro.params;
const data = await sanityClient.fetch(query, { slug });
---
```

### Routing

File-based, just like Next.js App Router:

| Next.js (App Router) | Astro |
|----------------------|-------|
| `src/app/page.tsx` | `src/pages/index.astro` |
| `src/app/about/page.tsx` | `src/pages/about.astro` |
| `src/app/beverages/[slug]/page.tsx` | `src/pages/beverages/[slug].astro` |

### Layout

Next.js `layout.tsx` becomes `src/layouts/Layout.astro`. Child content is injected via `<slot />` instead of `{children}`:

```astro
<body>
  <header>...</header>
  <slot />  <!-- equivalent to {children} -->
  <footer>...</footer>
</body>
```

Pages use the layout by importing it:
```astro
---
import Layout from "@/layouts/Layout.astro";
---
<Layout title="About">
  <h1>About us</h1>
</Layout>
```

## What Changed

### Removed
- `next`, `next-sanity`, `next.config.mjs`, `next-env.d.ts`
- `next/image` — replaced by plain `<img>` (Sanity CDN handles image optimization for remote images)
- `next/link` — replaced by plain `<a>` (Astro prefetches by default)
- `next/font/google` — replaced by Fontsource packages (`@fontsource/saira`, `@fontsource/permanent-marker`)

### Added
- `astro`, `@astrojs/react`, `@sanity/astro`, `astro-portabletext`
- `@astrojs/check` for type checking
- `@fontsource/saira`, `@fontsource/permanent-marker`

### Kept as-is
- All React components using Motion (scroll animations) — now hydrated as islands
- `@sanity/image-url` for Sanity image URLs
- `@portabletext/react` for PortableText rendering inside React islands
- SCSS global styles (just moved from `src/app/` to `src/styles/`)
- Biome for linting/formatting (configured to skip `.astro` files)
- TypeScript interfaces

### Component Classification

| Component | Type | Reason |
|-----------|------|--------|
| `LandingHero` | React island (`client:load`) | Motion scroll animations |
| `BeerHero` | React island (`client:load`) | Motion scroll animations |
| `BeerOverview` | React island (`client:visible`) | Motion scroll animations |
| `EventOverview` | React island (`client:visible`) | Motion scroll animations |
| `MerchOverview` | React island (`client:visible`) | Motion scroll animations |
| `AgeGate` | React island (`client:idle`) | Client-side cookie state |
| `BeerGrid` | Astro component | Static list, no interactivity |
| `BeerThumb` | Astro component | Static card, no interactivity |
| `EmployeeGrid` | Astro component | Static list, no interactivity |

## Fonts

Next.js `next/font/google` was replaced by Fontsource. Instead of generating font classes dynamically, we use CSS classes:

- `.font-saira` — body font (applied on `<body>`)
- `.font-marker` — accent font (replaces `permMarker.className`)

These are defined in a global `<style is:global>` block in `Layout.astro`.

## Deployment

Still deployed to Vercel. Vercel auto-detects Astro projects. The build output is fully static HTML — no serverless functions needed.

For content freshness: set up a Vercel Deploy Hook and a Sanity Webhook so publishing content triggers a rebuild (~10-20s for this site).

## Development

```bash
npm install
npm run dev      # Start dev server on localhost:4321
npm run build    # Production build to dist/
npm run preview  # Preview production build locally
npm run check    # Type check + lint + build
```

## Visual Regression Testing

A Playwright-based visual comparison script is included at `tests/visual-compare.spec.ts`. It captures screenshots of both the production and preview sites and compares them:

```bash
PRODUCTION_URL=https://bryggverket.se PREVIEW_URL=https://<preview>.vercel.app \
  npx playwright test tests/visual-compare.spec.ts
```

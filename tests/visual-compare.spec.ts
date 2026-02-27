/**
 * Visual regression test comparing the production site against a preview deployment.
 *
 * Usage:
 *   PRODUCTION_URL=https://bryggverket.se PREVIEW_URL=https://<preview>.vercel.app \
 *     npx playwright test tests/visual-compare.spec.ts
 *
 * Both URLs default to localhost if not set (useful for local spot-checking).
 * Screenshots are saved to tests/__screenshots__/ and diffs to test-results/.
 */
import { expect, test } from "@playwright/test";

const PRODUCTION_URL = process.env.PRODUCTION_URL ?? "http://localhost:4321";
const PREVIEW_URL = process.env.PREVIEW_URL ?? "http://localhost:4322";

const ROUTES = [
  "/",
  "/beverages",
  "/beverages/red-barn",
  "/about",
  "/book",
];

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 375, height: 812 },
];

async function dismissAgeGate(page: import("@playwright/test").Page) {
  const btn = page.locator(".ageGateButtons .btn").first();
  try {
    await btn.waitFor({ state: "visible", timeout: 3000 });
    await btn.click();
    await page.waitForTimeout(500);
  } catch {
    // age gate may already be dismissed via cookie
  }
}

for (const viewport of VIEWPORTS) {
  for (const route of ROUTES) {
    const label = `${viewport.name} ${route === "/" ? "home" : route.replace(/\//g, "-").slice(1)}`;

    test(`visual match: ${label}`, async ({ browser }) => {
      const ctx = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });

      const prodPage = await ctx.newPage();
      await prodPage.goto(`${PRODUCTION_URL}${route}`, {
        waitUntil: "networkidle",
      });
      await dismissAgeGate(prodPage);
      const prodShot = await prodPage.screenshot({ fullPage: true });

      const previewPage = await ctx.newPage();
      await previewPage.goto(`${PREVIEW_URL}${route}`, {
        waitUntil: "networkidle",
      });
      await dismissAgeGate(previewPage);
      const previewShot = await previewPage.screenshot({ fullPage: true });

      expect(previewShot).toMatchSnapshot(`${label}.png`, {
        maxDiffPixelRatio: 0.02,
      });

      // Save production screenshot as reference for manual comparison
      await prodPage.screenshot({
        fullPage: true,
        path: `tests/__screenshots__/prod-${label}.png`,
      });
      await previewPage.screenshot({
        fullPage: true,
        path: `tests/__screenshots__/preview-${label}.png`,
      });

      await ctx.close();
    });
  }
}

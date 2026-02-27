import react from "@astrojs/react";
import sanity from "@sanity/astro";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  integrations: [
    react(),
    sanity({
      projectId: "b0e19xpn",
      dataset: "production",
      apiVersion: "2024-05-11",
      useCdn: true,
    }),
  ],
});

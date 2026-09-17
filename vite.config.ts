// @lovable.dev/vite-tanstack-config already includes the following - do NOT add them manually:
// - Tanstack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsconfigPaths...
// - nitro (build-only using cloudflare as a default target), VITE_* env injection, @...
// - React/Tanstack dedupe, error logger plugins, and sandbox detection (port/host/strict...)
// You can pass additional config via defineConfig(vite: { ... } etc..) if needed.

import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // ВАЖЛИВО: Назва має точно збігатися з назвою вашого репозиторію на GitHub
  base: '/HNUPS-Market/', 
  
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper)
    server: { entry: "server" },
  },
});

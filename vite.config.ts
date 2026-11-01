import { defineConfig } from "vite";

export default defineConfig({
  // Relative asset URLs so the build works under any path
  // (served at bodgingbear.dev/projects/ggj-2024/play/).
  base: "./",
  build: {
    assetsInlineLimit: 0,
  },
});

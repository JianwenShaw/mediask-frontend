import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  root: fileURLToPath(new URL("./", import.meta.url)),
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  plugins: [tailwindcss()],
  build: {
    outDir: "build",
    emptyOutDir: true,
  },
  server: {
    fs: {
      allow: [
        fileURLToPath(new URL("./", import.meta.url)),
        fileURLToPath(new URL("../../packages/shared-types", import.meta.url)),
        fileURLToPath(new URL("../../packages/api-client", import.meta.url)),
      ],
    },
  },
});

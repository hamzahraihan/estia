import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), babel({ presets: [reactCompilerPreset()] })],
  build: {
    rollupOptions: {
      output: {
        // Landing chunk stayed > 400 kB after the route split, so gsap (used
        // on every landing section) gets its own cacheable vendor chunk.
        // Function form: Vite 8 only types manualChunks as a function.
        manualChunks: (id) => {
          if (id.includes("node_modules/gsap")) return "gsap";
        },
      },
    },
  },
});

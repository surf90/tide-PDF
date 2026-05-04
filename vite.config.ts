import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // GitHub Pages で https://surf90.github.io/tide-PDF/ 配下に置く想定
  base: process.env.NODE_ENV === "production" ? "/tide-PDF/" : "/",
});

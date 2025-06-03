import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

console.log("Using vite.config.js");

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5200,
  },
});

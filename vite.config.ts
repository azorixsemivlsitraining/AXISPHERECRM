import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: [".", "./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add SPA routing middleware before Express to handle client-side routes
      server.middlewares.use((req, res, next) => {
        // If the request is for a non-existent file and doesn't start with /api,
        // serve index.html to let React Router handle it
        if (!req.url.startsWith("/api") && !req.url.includes(".")) {
          req.url = "/index.html";
        }
        next();
      });

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}

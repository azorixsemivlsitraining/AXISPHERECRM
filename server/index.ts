import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleApolloProxy } from "./routes/apollo";
import { handleGetCompanies } from "./routes/companies";
import { handleSyncCompanies } from "./routes/sync-companies";
import {
  handleAuthSignIn,
  handleAuthSignUp,
  handleAuthSignOut,
  handleAuthSession,
} from "./routes/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Demo routes
  app.get("/api/demo", handleDemo);

  // Auth routes (server-side proxy to avoid response body issues)
  app.post("/api/auth/sign-in", handleAuthSignIn);
  app.post("/api/auth/sign-up", handleAuthSignUp);
  app.post("/api/auth/sign-out", handleAuthSignOut);
  app.get("/api/auth/session", handleAuthSession);

  // Debug endpoint to check API key
  app.get("/api/debug-key", (_req, res) => {
    const apiKey = process.env.VITE_APOLLO_API_KEY;
    res.json({
      hasApiKey: !!apiKey,
      keyPreview: apiKey ? apiKey.substring(0, 10) + "..." : "NOT SET",
      allVars: Object.keys(process.env)
        .filter((k) => k.includes("APOLLO"))
        .sort(),
    });
  });

  // Companies API
  app.get("/api/companies", handleGetCompanies);
  app.post("/api/sync-companies", handleSyncCompanies);

  // Apollo proxy
  app.post("/api/apollo", handleApolloProxy);

  // SPA fallback - serve index.html for all non-API routes
  app.use((_req, res, next) => {
    // Only apply fallback to non-API routes
    if (!_req.path.startsWith("/api")) {
      // In development, Vite handles index.html
      // In production, we serve the built index.html
      if (process.env.NODE_ENV === "production") {
        res.sendFile("dist/spa/index.html", { root: process.cwd() });
      } else {
        // For development, let Vite handle it
        next();
      }
    } else {
      next();
    }
  });

  return app;
}

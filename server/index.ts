import "dotenv/config";
import express, { RequestHandler } from "express";
import cors from "cors";
import path from "path";
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

  // Serve static files in production
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(process.cwd(), "dist/spa")));
  }

  // SPA fallback - serve index.html for all non-API routes (catch-all at the end)
  const spaFallback: RequestHandler = (_req, res) => {
    if (process.env.NODE_ENV === "production") {
      res.sendFile(path.join(process.cwd(), "dist/spa/index.html"));
    } else {
      // In development, return a simple message - Vite will handle the actual page
      res.send("<!DOCTYPE html><html><body>Not Found</body></html>");
    }
  };

  app.get("*", spaFallback);

  return app;
}

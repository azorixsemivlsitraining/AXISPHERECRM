import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleApolloProxy } from "./routes/apollo";
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

  // Apollo proxy
  app.post("/api/apollo", handleApolloProxy);

  return app;
}

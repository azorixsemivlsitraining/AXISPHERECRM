import serverless from "serverless-http";

import { createServer } from "../../server";

// Create the serverless handler with proper configuration
const app = createServer();

// Ensure responses are properly serialized
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (body: any) {
    res.setHeader("Content-Type", "application/json");
    return originalJson.call(this, body);
  };
  next();
});

export const handler = serverless(app);

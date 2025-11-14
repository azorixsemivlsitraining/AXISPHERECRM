import { RequestHandler } from "express";

const APOLLO_BASE_URL = "https://api.apollo.io/v1";

export const handleApolloProxy: RequestHandler = async (req, res) => {
  try {
    const APOLLO_API_KEY = process.env.VITE_APOLLO_API_KEY;
    if (!APOLLO_API_KEY) {
      console.error("Missing VITE_APOLLO_API_KEY environment variable");
      return res.status(500).json({
        error: "Apollo API key not configured",
      });
    }

    const { endpoint, method = "POST", body } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        error: "Missing endpoint parameter",
      });
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${APOLLO_API_KEY}`,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method === "POST") {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${APOLLO_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: `Apollo API error: ${response.status}`,
        details: errorData,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Apollo proxy error:", error);
    res.status(500).json({
      error: "Failed to call Apollo API",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables on server");
}

// Create server-side Supabase client
const serverSupabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const handleAuthSignIn: RequestHandler = async (req, res) => {
  try {
    if (!serverSupabase) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const { data, error } = await serverSupabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Auth error:", error);
      return res.status(401).json({ error: error.message });
    }

    // Return auth data and session
    res.json({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error("Sign in error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Sign in failed",
    });
  }
};

export const handleAuthSignUp: RequestHandler = async (req, res) => {
  try {
    if (!serverSupabase) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const { data, error } = await serverSupabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Auth error:", error);
      return res.status(400).json({ error: error.message });
    }

    // Return auth data
    res.json({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error("Sign up error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Sign up failed",
    });
  }
};

export const handleAuthSignOut: RequestHandler = async (req, res) => {
  try {
    if (!serverSupabase) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ error: "No authorization token" });
    }

    // Verify and sign out user
    const {
      data: { user },
      error: userError,
    } = await serverSupabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { error } = await serverSupabase.auth.signOut();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Sign out error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Sign out failed",
    });
  }
};

export const handleAuthSession: RequestHandler = async (req, res) => {
  try {
    if (!serverSupabase) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.json({ session: null });
    }

    const {
      data: { user },
      error,
    } = await serverSupabase.auth.getUser(token);

    if (error || !user) {
      return res.json({ session: null });
    }

    res.json({ user });
  } catch (error) {
    console.error("Session check error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Session check failed",
    });
  }
};

export const handlePasswordReset: RequestHandler = async (req, res) => {
  try {
    if (!serverSupabase) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const { error } = await serverSupabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${req.headers.origin || "http://localhost:8080"}/reset-password`,
    });

    if (error) {
      console.error("Password reset error:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      message: "Password reset email sent. Please check your email.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Password reset failed",
    });
  }
};

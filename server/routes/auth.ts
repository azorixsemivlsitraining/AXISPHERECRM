import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables on server");
}

// Create server-side Supabase client
const serverSupabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Create admin Supabase client for deleting users
const adminSupabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

export const handleAuthSignIn: RequestHandler = async (req, res) => {
  try {
    if (!serverSupabase) {
      console.error(
        "[Auth SignIn] Missing Supabase client - VITE_SUPABASE_URL:",
        !!process.env.VITE_SUPABASE_URL,
        "VITE_SUPABASE_ANON_KEY:",
        !!process.env.VITE_SUPABASE_ANON_KEY,
      );
      return res
        .status(500)
        .setHeader("Content-Type", "application/json")
        .end(
          JSON.stringify({
            error: "Server configuration error",
            details: "Supabase client not initialized",
          }),
        );
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .setHeader("Content-Type", "application/json")
        .end(
          JSON.stringify({ error: "Email and password required" }),
        );
    }

    console.log("[Auth SignIn] Attempting login for:", email);

    const { data, error } = await serverSupabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[Auth SignIn] Authentication failed:", error.message);
      return res
        .status(401)
        .setHeader("Content-Type", "application/json")
        .end(JSON.stringify({ error: error.message }));
    }

    if (!data.user) {
      console.error("[Auth SignIn] No user data returned");
      return res
        .status(401)
        .setHeader("Content-Type", "application/json")
        .end(JSON.stringify({ error: "Invalid credentials" }));
    }

    // Return auth data and session
    console.log("[Auth SignIn] Login successful for:", data.user.email);
    return res
      .status(200)
      .setHeader("Content-Type", "application/json")
      .end(
        JSON.stringify({
          user: data.user,
          session: data.session,
        }),
      );
  } catch (error) {
    console.error("[Auth SignIn] Unexpected error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Sign in failed";
    return res
      .status(500)
      .setHeader("Content-Type", "application/json")
      .end(
        JSON.stringify({
          error: errorMessage,
          details: "An unexpected error occurred during sign in",
        }),
      );
  }
};

export const handleAuthSignUp: RequestHandler = async (req, res) => {
  try {
    if (!serverSupabase) {
      return res
        .status(500)
        .setHeader("Content-Type", "application/json")
        .end(JSON.stringify({ error: "Server configuration error" }));
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .setHeader("Content-Type", "application/json")
        .end(
          JSON.stringify({ error: "Email and password required" }),
        );
    }

    const { data, error } = await serverSupabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Auth error:", error);
      return res
        .status(400)
        .setHeader("Content-Type", "application/json")
        .end(JSON.stringify({ error: error.message }));
    }

    // Return auth data
    return res
      .status(200)
      .setHeader("Content-Type", "application/json")
      .end(
        JSON.stringify({
          user: data.user,
          session: data.session,
        }),
      );
  } catch (error) {
    console.error("Sign up error:", error);
    return res
      .status(500)
      .setHeader("Content-Type", "application/json")
      .end(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Sign up failed",
        }),
      );
  }
};

export const handleAuthSignOut: RequestHandler = async (req, res) => {
  try {
    if (!serverSupabase) {
      return res
        .status(500)
        .setHeader("Content-Type", "application/json")
        .end(JSON.stringify({ error: "Server configuration error" }));
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(400)
        .setHeader("Content-Type", "application/json")
        .end(JSON.stringify({ error: "No authorization token" }));
    }

    // Verify and sign out user
    const {
      data: { user },
      error: userError,
    } = await serverSupabase.auth.getUser(token);

    if (userError || !user) {
      return res
        .status(401)
        .setHeader("Content-Type", "application/json")
        .end(JSON.stringify({ error: "Invalid token" }));
    }

    const { error } = await serverSupabase.auth.signOut();

    if (error) {
      return res
        .status(400)
        .setHeader("Content-Type", "application/json")
        .end(JSON.stringify({ error: error.message }));
    }

    return res
      .status(200)
      .setHeader("Content-Type", "application/json")
      .end(JSON.stringify({ success: true }));
  } catch (error) {
    console.error("Sign out error:", error);
    return res
      .status(500)
      .setHeader("Content-Type", "application/json")
      .end(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Sign out failed",
        }),
      );
  }
};

export const handleAuthSession: RequestHandler = async (req, res) => {
  try {
    if (!serverSupabase) {
      return res
        .status(500)
        .setHeader("Content-Type", "application/json")
        .end(JSON.stringify({ error: "Server configuration error" }));
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(200)
        .setHeader("Content-Type", "application/json")
        .end(JSON.stringify({ session: null }));
    }

    const {
      data: { user },
      error,
    } = await serverSupabase.auth.getUser(token);

    if (error || !user) {
      return res
        .status(200)
        .setHeader("Content-Type", "application/json")
        .end(JSON.stringify({ session: null }));
    }

    return res
      .status(200)
      .setHeader("Content-Type", "application/json")
      .end(JSON.stringify({ user }));
  } catch (error) {
    console.error("Session check error:", error);
    return res
      .status(500)
      .setHeader("Content-Type", "application/json")
      .end(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Session check failed",
        }),
      );
  }
};

export const handlePasswordReset: RequestHandler = async (req, res) => {
  try {
    if (!serverSupabase) {
      return res
        .status(500)
        .setHeader("Content-Type", "application/json")
        .end(JSON.stringify({ error: "Server configuration error" }));
    }

    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .setHeader("Content-Type", "application/json")
        .end(JSON.stringify({ error: "Email is required" }));
    }

    const { error } = await serverSupabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${req.headers.origin || "http://localhost:8080"}/reset-password`,
    });

    if (error) {
      console.error("Password reset error:", error);
      return res
        .status(400)
        .setHeader("Content-Type", "application/json")
        .end(JSON.stringify({ error: error.message }));
    }

    return res
      .status(200)
      .setHeader("Content-Type", "application/json")
      .end(
        JSON.stringify({
          success: true,
          message: "Password reset email sent. Please check your email.",
        }),
      );
  } catch (error) {
    console.error("Password reset request error:", error);
    return res
      .status(500)
      .setHeader("Content-Type", "application/json")
      .end(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Password reset failed",
        }),
      );
  }
};

export const handleDeleteAuthUser: RequestHandler = async (req, res) => {
  try {
    if (!adminSupabase) {
      return res.status(500).json({
        error: "Server configuration error: service role key not configured",
        details: "SUPABASE_SERVICE_ROLE_KEY is not set",
      });
    }

    const { authId } = req.body;

    if (!authId) {
      return res.status(400).json({
        error: "Missing required field: authId",
      });
    }

    const { error } = await adminSupabase.auth.admin.deleteUser(authId);

    if (error) {
      console.error("Error deleting auth user:", error);
      return res.status(400).json({
        error: "Failed to delete user account",
        details: error.message,
      });
    }

    res.json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.error("Delete auth user error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Delete failed",
    });
  }
};

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export type UserRole = "salesperson" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Check if it's an admin
        const isAdmin =
          session.user.email === "admin@axisphere.in";

        if (isAdmin) {
          setUser({
            id: "admin",
            email: session.user.email || "admin@axisphere.in",
            name: "Admin",
            role: "admin",
          });
        } else {
          // It's a salesperson
          try {
            const { data, error } = await supabase
              .from("salespersons")
              .select("id, name, email")
              .eq("auth_id", session.user.id)
              .single();

            if (error) {
              console.error("Error fetching salesperson record:", error);
              return;
            }

            if (data) {
              setUser({
                id: data.id,
                email: data.email,
                name: data.name,
                role: "salesperson",
              });
            }
          } catch (dbError) {
            console.error("Database error during auth check:", dbError);
          }
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Check if it's admin credentials
      if (email === "admin@axisphere.in" && password === "admin2024") {
        // For admin, we just set the user without Supabase auth
        setUser({
          id: "admin",
          email: "admin@axisphere.in",
          name: "Admin",
          role: "admin",
        });
        return;
      }

      // For salesperson, use Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Auth sign in error:", error);
        throw error;
      }

      if (!data.user) {
        throw new Error("No user returned from login");
      }

      try {
        const { data: userData, error: dbError } = await supabase
          .from("salespersons")
          .select("id, name, email")
          .eq("auth_id", data.user.id)
          .single();

        if (dbError) {
          console.error(
            "Error fetching salesperson record after login:",
            dbError,
          );
          throw new Error("Could not fetch user profile: " + dbError.message);
        }

        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: "salesperson",
          });
        } else {
          throw new Error("No user profile found. Please contact support.");
        }
      } catch (dbError) {
        console.error("Database error during login:", dbError);
        throw dbError;
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error("Auth sign up error:", authError);
        throw new Error(authError.message || "Failed to create account");
      }

      if (!authData.user) {
        throw new Error("No user returned from signup");
      }

      console.log("Auth user created:", authData.user.id);

      // Step 2: Create salesperson record
      try {
        const { data: userData, error: insertError } = await supabase
          .from("salespersons")
          .insert([
            {
              auth_id: authData.user.id,
              email,
              name,
            },
          ])
          .select("id, name, email")
          .single();

        if (insertError) {
          console.error("Error inserting salesperson record:", insertError);
          throw new Error(insertError.message || "Failed to create profile");
        }

        if (userData) {
          console.log("Salesperson record created:", userData.id);
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: "salesperson",
          });
        } else {
          throw new Error("Failed to retrieve created profile");
        }
      } catch (dbError) {
        console.error("Database error during registration:", dbError);
        throw dbError;
      }
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

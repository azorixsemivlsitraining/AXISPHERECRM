import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
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
            });
          }
        } catch (dbError) {
          console.error("Database error during auth check:", dbError);
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: userData } = await supabase
        .from("salespersons")
        .select("id, name, email")
        .eq("auth_id", data.user.id)
        .single();

      if (userData) {
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
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

        if (insertError) throw insertError;

        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
          });
        }
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

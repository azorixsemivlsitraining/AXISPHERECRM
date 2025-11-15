import { Link, useLocation } from "react-router-dom";
import { Users, UserCheck, BarChart3, Building2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: "/", label: "Dashboard", icon: BarChart3 },
    { path: "/leads", label: "Leads", icon: Users },
    { path: "/salespersons", label: "Sales Persons", icon: UserCheck },
    { path: "/companies", label: "Companies", icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F59bf3e928fc9473a97d5e87470c824bb%2F8211d605de7443fb8fd45193578c775d?format=webp&width=800"
                alt="Axisphere Logo"
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Axisphere</h1>
                <p className="text-xs text-slate-500">Sales CRM</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 transition-colors",
                    isActive
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-600 hover:text-slate-900",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-6">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F59bf3e928fc9473a97d5e87470c824bb%2F8211d605de7443fb8fd45193578c775d?format=webp&width=800"
              alt="Axisphere Logo"
              className="h-8 w-auto"
            />
            <div>
              <p className="text-sm font-semibold text-slate-900">Axisphere Sales CRM</p>
              <p className="text-xs text-slate-500">Manage your sales pipeline efficiently</p>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-6 text-center">
            <p className="text-sm text-slate-600">
              © 2025 Axisphere. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

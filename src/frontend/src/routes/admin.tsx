import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { createRoute } from "@tanstack/react-router";
import { LogIn, Shield } from "lucide-react";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

function AdminPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <div
          className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 flex flex-col items-center gap-6 shadow-elevated"
          data-ocid="admin-login-card"
        >
          {/* Branding */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center">
              <Shield className="w-7 h-7 text-accent" />
            </div>
            <div className="text-center">
              <h1 className="font-display text-xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Mono-peedika · Secure Access
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="w-full bg-muted/60 rounded-lg px-4 py-3 text-sm text-muted-foreground text-center">
            Sign in with Internet Identity to manage products, orders, and
            inventory.
          </div>

          {/* Login Button */}
          <button
            type="button"
            onClick={() => login()}
            disabled={loginStatus === "logging-in"}
            className="w-full flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            data-ocid="admin-login-btn"
          >
            {loginStatus === "logging-in" ? (
              <>
                <span className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Login with Internet Identity
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

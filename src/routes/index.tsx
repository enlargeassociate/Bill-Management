import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { useHydrated } from "@/hooks/use-hydrated";

export const Route = createFileRoute("/")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const { login, isAuthenticated, isLoading, currentUser } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const getRedirect = () => currentUser?.role === "ADMIN" ? "/dashboard" : "/pending-bills";

  useEffect(() => {
    if (hydrated && isAuthenticated) navigate({ to: getRedirect() });
  }, [hydrated, isAuthenticated, currentUser, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = await login(username, password);
    if (!result.ok) {
      setError(result.error ?? "Login failed.");
      return;
    }
    // Need to get the user from store after login
    const user = useAuthStore.getState().currentUser;
    navigate({ to: user?.role === "ADMIN" ? "/dashboard" : "/pending-bills" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <ReceiptText className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <span className="font-bold text-sidebar-foreground">Enlarge Associate</span>
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="text-3xl font-bold leading-tight text-sidebar-foreground">
            Bill &amp; company management, all in one clean workspace.
          </h2>
          <p className="text-sidebar-foreground/70">
            Track pending and completed bills, record payment methods, and monitor outstanding
            amounts across every company you work with.
          </p>
        </div>
        <p className="text-xs text-sidebar-foreground/50">
          Connected to MongoDB Atlas
        </p>
      </div>

      <div className="flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <ReceiptText className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold">Enlarge Associate</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your credentials to access the dashboard.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error ? (
              <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-destructive">{error}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

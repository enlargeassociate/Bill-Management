import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/store/authStore";
import { useHydrated } from "@/hooks/use-hydrated";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoadingState } from "@/components/common/LoadingState";

export function ProtectedPage({
  title,
  subtitle,
  children,
  adminOnly = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentUser = useAuthStore((s) => s.currentUser);

  useEffect(() => {
    if (hydrated && !isAuthenticated) navigate({ to: "/" });
    if (hydrated && isAuthenticated && adminOnly && currentUser?.role !== "ADMIN") {
      navigate({ to: "/pending-bills" });
    }
  }, [hydrated, isAuthenticated, adminOnly, currentUser, navigate]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingState rows={6} />
      </div>
    );
  }

  if (adminOnly && currentUser?.role !== "ADMIN") {
    return null;
  }

  return (
    <DashboardLayout title={title} {...(subtitle ? { subtitle } : {})}>
      {children}
    </DashboardLayout>
  );
}

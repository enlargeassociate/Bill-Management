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
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (hydrated && !isAuthenticated) navigate({ to: "/" });
  }, [hydrated, isAuthenticated, navigate]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingState rows={6} />
      </div>
    );
  }

  return (
    <DashboardLayout title={title} {...(subtitle ? { subtitle } : {})}>
      {children}
    </DashboardLayout>
  );
}

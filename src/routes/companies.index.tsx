import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { SearchInput } from "@/components/common/SearchInput";
import { CompanyTable } from "@/components/companies/CompanyTable";
import { CompanyForm } from "@/components/companies/CompanyForm";
import { LoadingState } from "@/components/common/LoadingState";
import { useAuthStore } from "@/store/authStore";
import { useCompanies } from "@/hooks/use-companies";
import { canAddCompany } from "@/lib/permissions";

export const Route = createFileRoute("/companies/")({
  component: CompaniesPage,
});

function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const user = useAuthStore((s) => s.currentUser);
  const { data: companies = [], isLoading } = useCompanies();

  if (isLoading) return <ProtectedPage title="Companies" subtitle="Loading…" adminOnly><LoadingState /></ProtectedPage>;

  return (
    <ProtectedPage title="Companies" subtitle="Your company directory and their bill totals" adminOnly>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by company name or phone…"
            className="sm:max-w-sm"
          />
          {canAddCompany(user) ? (
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Add Company
            </Button>
          ) : null}
        </div>
        <CompanyTable search={search} companies={companies} />
      </div>
      <CompanyForm open={addOpen} onOpenChange={setAddOpen} />
    </ProtectedPage>
  );
}

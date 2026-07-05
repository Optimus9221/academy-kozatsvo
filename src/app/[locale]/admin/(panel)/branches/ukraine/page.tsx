"use client";

import { BranchesAdmin } from "@/components/admin/BranchesAdmin";

export default function AdminUkraineBranchesPage() {
  return (
    <BranchesAdmin
      type="UKRAINE"
      title="Представництва (Украина)"
      basePath="/admin/branches/ukraine"
    />
  );
}

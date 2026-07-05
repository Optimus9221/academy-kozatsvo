"use client";

import { BranchesAdmin } from "@/components/admin/BranchesAdmin";

export default function AdminInternationalBranchesPage() {
  return (
    <BranchesAdmin
      type="INTERNATIONAL"
      title="Представництва (закордон)"
      basePath="/admin/branches/international"
    />
  );
}

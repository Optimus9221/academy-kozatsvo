"use client";

import { BranchForm } from "@/components/admin/BranchForm";

export default function NewInternationalBranchPage() {
  return <BranchForm type="INTERNATIONAL" basePath="/admin/branches/international" />;
}

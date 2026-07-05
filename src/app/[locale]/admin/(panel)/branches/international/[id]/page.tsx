"use client";

import { useParams } from "next/navigation";
import { BranchForm } from "@/components/admin/BranchForm";

export default function EditInternationalBranchPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <BranchForm
      type="INTERNATIONAL"
      basePath="/admin/branches/international"
      editId={id}
    />
  );
}

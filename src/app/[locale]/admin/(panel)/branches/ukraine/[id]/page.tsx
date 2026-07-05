"use client";

import { useParams } from "next/navigation";
import { BranchForm } from "@/components/admin/BranchForm";

export default function EditUkraineBranchPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <BranchForm
      type="UKRAINE"
      basePath="/admin/branches/ukraine"
      editId={id}
    />
  );
}

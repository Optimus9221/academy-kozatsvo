"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function BranchesAdmin({
  type,
  title,
  basePath,
}: {
  type: "UKRAINE" | "INTERNATIONAL";
  title: string;
  basePath: string;
}) {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const tb = useTranslations("branches");
  const tj = useTranslations("join");
  const [branches, setBranches] = useState<
    Array<{ id: string; name: string; city: string; region?: string; country?: string }>
  >([]);

  useEffect(() => {
    fetch(`/api/admin/branches?type=${type.toLowerCase()}`)
      .then((r) => r.json())
      .then(setBranches);
  }, [type]);

  async function handleDelete(id: string) {
    if (!confirm(t("deleteConfirm"))) return;
    await fetch(`/api/admin/branches/${id}`, { method: "DELETE" });
    setBranches((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-blue">{title}</h1>
        <Link href={`${basePath}/new`} className="admin-btn admin-btn-primary">
          + {tc("create")}
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-md">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("name")}</th>
              <th>{tj("city")}</th>
              <th>{type === "UKRAINE" ? tb("filterRegion") : tb("filterCountry")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {branches.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.city}</td>
                <td>{type === "UKRAINE" ? b.region : b.country}</td>
                <td className="space-x-2">
                  <Link href={`${basePath}/${b.id}`} className="text-ukraine-blue hover:underline">
                    {tc("edit")}
                  </Link>
                  <button onClick={() => handleDelete(b.id)} className="text-red-600 hover:underline">
                    {tc("delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

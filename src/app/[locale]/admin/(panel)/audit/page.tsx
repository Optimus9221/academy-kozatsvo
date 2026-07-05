"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
}

export default function AdminAuditPage() {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("");

  useEffect(() => {
    const params = entityFilter ? `?entity=${encodeURIComponent(entityFilter)}` : "";
    fetch(`/api/admin/audit${params}`)
      .then((r) => r.json())
      .then(setLogs)
      .finally(() => setLoading(false));
  }, [entityFilter]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-dark-blue">{t("auditLog")}</h1>
        <input
          placeholder={t("filterEntity")}
          className="admin-input max-w-xs"
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="mt-8 text-text-muted">{tc("loading")}</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-md">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("publishedAt")}</th>
                <th>{t("user")}</th>
                <th>{t("action")}</th>
                <th>{t("entity")}</th>
                <th>ID</th>
                <th>{t("details")}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap text-sm">
                    {new Date(log.createdAt).toLocaleString("uk-UA")}
                  </td>
                  <td>{log.user?.name || log.userId}</td>
                  <td>{log.action}</td>
                  <td>{log.entity}</td>
                  <td className="max-w-[120px] truncate text-xs text-text-muted">
                    {log.entityId || "—"}
                  </td>
                  <td className="max-w-[200px] truncate text-xs text-text-muted">
                    {log.details || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

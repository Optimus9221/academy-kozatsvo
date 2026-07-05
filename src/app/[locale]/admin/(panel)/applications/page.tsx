"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/admin/AdminUtils";

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  motivationText: string;
  status: string;
  moderatorNote?: string;
  createdAt: string;
}

export default function AdminApplicationsPage() {
  const tc = useTranslations("common");
  const [apps, setApps] = useState<Application[]>([]);
  const [selected, setSelected] = useState<Application | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  function load() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/applications?${params}`).then((r) => r.json()).then(setApps);
  }

  useEffect(() => { load(); }, [search, statusFilter]);

  async function updateStatus(id: string, status: string, moderatorNote?: string) {
    await fetch(`/api/admin/applications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, moderatorNote }),
    });
    load();
    setSelected(null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-dark-blue">Заявки</h1>
        <a href="/api/admin/applications?format=csv" className="admin-btn admin-btn-secondary">
          {tc("exportCsv")}
        </a>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <input placeholder="Пошук..." className="admin-input max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="admin-input max-w-xs" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Усі статуси</option>
          <option value="NEW">Новая</option>
          <option value="IN_PROGRESS">В обробці</option>
          <option value="APPROVED">Схвалено</option>
          <option value="REJECTED">Відхилено</option>
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-md">
        <table className="admin-table">
          <thead>
            <tr><th>ПІБ</th><th>Email</th><th>Місто</th><th>Статус</th><th>Дата</th><th></th></tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <tr key={app.id}>
                <td>{app.fullName}</td>
                <td>{app.email}</td>
                <td>{app.city}, {app.country}</td>
                <td><StatusBadge status={app.status} /></td>
                <td>{new Date(app.createdAt).toLocaleDateString("uk-UA")}</td>
                <td>
                  <button onClick={() => setSelected(app)} className="text-ukraine-blue hover:underline">
                    Відкрити
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl bg-white p-6">
            <h2 className="text-xl font-bold">{selected.fullName}</h2>
            <div className="mt-4 space-y-2 text-sm">
              <p><strong>Телефон:</strong> {selected.phone}</p>
              <p><strong>Email:</strong> {selected.email}</p>
              <p><strong>Місто:</strong> {selected.city}, {selected.country}</p>
              <p><strong>Мотивація:</strong></p>
              <p className="rounded bg-gray-50 p-3">{selected.motivationText}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["NEW", "IN_PROGRESS", "APPROVED", "REJECTED"].map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(selected.id, s)}
                  className={`admin-btn text-xs ${selected.status === s ? "admin-btn-primary" : "admin-btn-secondary"}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button onClick={() => setSelected(null)} className="mt-4 admin-btn admin-btn-secondary w-full">
              Закрити
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

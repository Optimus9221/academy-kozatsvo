"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { StatusBadge } from "@/components/admin/AdminUtils";

interface EventItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  startsAt: string;
  location: string | null;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/events")
      .then((r) => r.json())
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Видалити подію?")) return;
    await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-blue">Події</h1>
        <Link href="/admin/events/new" className="admin-btn admin-btn-primary">
          + Створити
        </Link>
      </div>

      {loading ? (
        <p className="mt-8 text-text-muted">Завантаження...</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-md">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Заголовок</th>
                <th>Місце</th>
                <th>Статус</th>
                <th>Дата</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {events.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td className="text-text-muted">{item.location || "—"}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td>
                    {new Date(item.startsAt).toLocaleDateString("uk-UA")}
                  </td>
                  <td className="space-x-2">
                    <Link
                      href={`/admin/events/${item.id}`}
                      className="text-ukraine-blue hover:underline"
                    >
                      Ред.
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:underline"
                    >
                      Видал.
                    </button>
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

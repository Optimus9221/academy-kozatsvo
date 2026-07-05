"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { StatusBadge } from "@/components/admin/AdminUtils";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
}

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/news")
      .then((r) => r.json())
      .then(setNews)
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Видалити новину?")) return;
    await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
    setNews((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-blue">Новини</h1>
        <Link href="/admin/news/new" className="admin-btn admin-btn-primary">
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
                <th>Slug</th>
                <th>Статус</th>
                <th>Дата</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {news.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td className="text-text-muted">{item.slug}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td>
                    {item.publishedAt
                      ? new Date(item.publishedAt).toLocaleDateString("uk-UA")
                      : "—"}
                  </td>
                  <td className="space-x-2">
                    <Link
                      href={`/admin/news/${item.id}`}
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

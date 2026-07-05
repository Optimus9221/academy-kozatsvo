"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

interface Album {
  id: string;
  title: string;
  slug: string;
  _count?: { items: number };
}

export default function AdminGalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    fetch("/api/admin/gallery/albums").then((r) => r.json()).then(setAlbums);
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Видалити альбом?")) return;
    await fetch(`/api/admin/gallery/albums/${id}`, { method: "DELETE" });
    setAlbums((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-blue">Галерея</h1>
        <Link href="/admin/gallery/new" className="admin-btn admin-btn-primary">+ Альбом</Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-md">
        <table className="admin-table">
          <thead>
            <tr><th>Назва</th><th>Slug</th><th>Елементів</th><th></th></tr>
          </thead>
          <tbody>
            {albums.map((a) => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td>{a.slug}</td>
                <td>{a._count?.items ?? 0}</td>
                <td className="space-x-2">
                  <Link href={`/admin/gallery/${a.id}`} className="text-ukraine-blue hover:underline">Ред.</Link>
                  <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:underline">Видал.</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

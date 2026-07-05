"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminContactPage() {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState(false);

  function load() {
    const params = filterUnread ? "?unread=true" : "";
    fetch(`/api/admin/contact${params}`)
      .then((r) => r.json())
      .then(setMessages)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [filterUnread]);

  async function markRead(id: string) {
    await fetch(`/api/admin/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    load();
    if (selected?.id === id) {
      setSelected((prev) => (prev ? { ...prev, isRead: true } : null));
    }
  }

  async function openMessage(msg: ContactMessage) {
    setSelected(msg);
    if (!msg.isRead) {
      await markRead(msg.id);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-dark-blue">{t("contactMessages")}</h1>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filterUnread}
            onChange={(e) => setFilterUnread(e.target.checked)}
          />
          {t("unreadOnly")}
        </label>
      </div>

      {loading ? (
        <p className="mt-8 text-text-muted">{tc("loading")}</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-md">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("name")}</th>
                <th>Email</th>
                <th>{t("subject")}</th>
                <th>{t("status")}</th>
                <th>{t("publishedAt")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg.id} className={!msg.isRead ? "bg-blue-50/50 font-medium" : ""}>
                  <td>{msg.fullName}</td>
                  <td>{msg.email}</td>
                  <td>{msg.subject || "—"}</td>
                  <td>{msg.isRead ? t("read") : t("unread")}</td>
                  <td>{new Date(msg.createdAt).toLocaleDateString("uk-UA")}</td>
                  <td>
                    <button
                      onClick={() => openMessage(msg)}
                      className="text-ukraine-blue hover:underline"
                    >
                      {tc("open")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl bg-white p-6">
            <h2 className="text-xl font-bold">{selected.fullName}</h2>
            <div className="mt-4 space-y-2 text-sm">
              <p><strong>Email:</strong> {selected.email}</p>
              {selected.phone && <p><strong>{t("phone")}:</strong> {selected.phone}</p>}
              {selected.subject && <p><strong>{t("subject")}:</strong> {selected.subject}</p>}
              <p><strong>{t("message")}:</strong></p>
              <p className="rounded bg-gray-50 p-3 whitespace-pre-wrap">{selected.message}</p>
              <p className="text-text-muted">
                {new Date(selected.createdAt).toLocaleString("uk-UA")}
              </p>
            </div>
            <button onClick={() => setSelected(null)} className="mt-4 admin-btn admin-btn-secondary w-full">
              {tc("close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

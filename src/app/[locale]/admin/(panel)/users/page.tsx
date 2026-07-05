"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const ROLES = ["ADMIN", "EDITOR", "MODERATOR"] as const;

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const tRoles = useTranslations("roles");
  const tc = useTranslations("common");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EDITOR",
  });
  const [error, setError] = useState("");

  function load() {
    fetch("/api/admin/users").then((r) => r.json()).then(setUsers);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || t("saveError"));
      return;
    }
    setForm({ name: "", email: "", password: "", role: "EDITOR" });
    setShowForm(false);
    load();
  }

  async function changeRole(id: string, role: string) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm(t("deleteConfirm"))) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || t("saveError"));
      return;
    }
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-blue">{t("users")}</h1>
        <button onClick={() => setShowForm(!showForm)} className="admin-btn admin-btn-primary">
          + {tc("create")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-6 max-w-xl space-y-4 rounded-xl bg-white p-6 shadow-md">
          <h2 className="font-semibold">{t("newUser")}</h2>
          {error && <div className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <input
            required
            placeholder={t("name")}
            className="admin-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            required
            type="email"
            placeholder="Email"
            className="admin-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            required
            type="password"
            placeholder={t("newPassword")}
            className="admin-input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <select
            className="admin-input"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{tRoles(r)}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="submit" className="admin-btn admin-btn-primary">{tc("create")}</button>
            <button type="button" onClick={() => setShowForm(false)} className="admin-btn">{tc("close")}</button>
          </div>
        </form>
      )}

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-md">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("name")}</th>
              <th>Email</th>
              <th>{t("role")}</th>
              <th>{t("publishedAt")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    className="admin-input py-1 text-sm"
                    value={user.role}
                    onChange={(e) => changeRole(user.id, e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{tRoles(r)}</option>
                    ))}
                  </select>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString("uk-UA")}</td>
                <td>
                  <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:underline">
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

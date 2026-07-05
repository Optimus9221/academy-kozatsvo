"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { SessionUser } from "@/lib/auth";

export default function AdminAccountPage() {
  const t = useTranslations("admin");
  const tRoles = useTranslations("roles");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUser(d.user);
      })
      .catch(() => setError(t("loadError")));
  }, [t]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);

    if (form.newPassword.length < 6) {
      setError(t("passwordTooShort"));
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("saveError"));
        return;
      }

      setSaved(true);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError(t("saveError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark-blue">{t("account")}</h1>

      {user && (
        <div className="mt-4 rounded-xl bg-white p-4 shadow-md">
          <p className="text-sm text-gray-500">{t("loggedInAs")}</p>
          <p className="font-semibold text-dark-blue">{user.name}</p>
          <p className="text-sm text-gray-600">{user.email}</p>
          <p className="mt-1 text-sm text-ukraine-blue">{tRoles(user.role)}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-6 max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md"
      >
        <h2 className="text-lg font-semibold text-dark-blue">{t("changePassword")}</h2>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {saved && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {t("passwordChanged")} ✓
          </div>
        )}

        <div>
          <label className="admin-label" htmlFor="currentPassword">
            {t("currentPassword")}
          </label>
          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            className="admin-input"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          />
        </div>

        <div>
          <label className="admin-label" htmlFor="newPassword">
            {t("newPassword")}
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            className="admin-input"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-500">{t("passwordHint")}</p>
        </div>

        <div>
          <label className="admin-label" htmlFor="confirmPassword">
            {t("confirmPassword")}
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            className="admin-input"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="admin-btn admin-btn-primary disabled:opacity-60"
        >
          {saving ? t("loginLoading") : saved ? `${t("passwordChanged")} ✓` : t("changePassword")}
        </button>
      </form>
    </div>
  );
}

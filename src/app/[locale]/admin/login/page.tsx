"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AdminLanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export default function AdminLoginPage() {
  const router = useRouter();
  const t = useTranslations("admin");
  const tMeta = useTranslations("meta");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login error");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dark-blue">
      <div className="mb-4">
        <AdminLanguageSwitcher />
      </div>
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ukraine-yellow text-2xl font-bold text-dark-blue">
            {tMeta("siteAbbr")}
          </div>
          <h1 className="text-2xl font-bold text-dark-blue">{t("loginTitle")}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="admin-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="admin-input"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="admin-btn admin-btn-primary w-full"
          >
            {loading ? t("loginLoading") : t("loginBtn")}
          </button>
        </form>
      </div>
    </div>
  );
}

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
  const [totpCode, setTotpCode] = useState("");
  const [pendingToken, setPendingToken] = useState<string | null>(null);
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
        body: JSON.stringify(
          pendingToken
            ? { pendingToken, totpCode }
            : { email, password }
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login error");
        return;
      }

      if (data.requires2fa && data.pendingToken) {
        setPendingToken(data.pendingToken);
        setTotpCode("");
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
          {pendingToken && (
            <p className="mt-2 text-sm text-gray-600">{t("twoFactorPrompt")}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!pendingToken ? (
            <>
              <div>
                <label className="admin-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="admin-input"
                  autoComplete="username"
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
                  autoComplete="current-password"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="admin-label" htmlFor="totpCode">
                {t("twoFactorCode")}
              </label>
              <input
                id="totpCode"
                type="text"
                inputMode="numeric"
                pattern="[0-9 ]*"
                maxLength={8}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                required
                autoFocus
                className="admin-input tracking-widest"
                autoComplete="one-time-code"
                placeholder="000000"
              />
              <button
                type="button"
                className="mt-2 text-sm text-ukraine-blue hover:underline"
                onClick={() => {
                  setPendingToken(null);
                  setTotpCode("");
                  setError("");
                }}
              >
                {t("twoFactorBack")}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="admin-btn admin-btn-primary w-full"
          >
            {loading
              ? t("loginLoading")
              : pendingToken
                ? t("twoFactorVerify")
                : t("loginBtn")}
          </button>
        </form>
      </div>
    </div>
  );
}

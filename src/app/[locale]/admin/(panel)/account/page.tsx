"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { SessionUser } from "@/lib/auth";

type AccountUser = SessionUser & { totpEnabled?: boolean };

export default function AdminAccountPage() {
  const t = useTranslations("admin");
  const tRoles = useTranslations("roles");
  const [user, setUser] = useState<AccountUser | null>(null);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [twoFaError, setTwoFaError] = useState("");
  const [twoFaMsg, setTwoFaMsg] = useState("");
  const [twoFaBusy, setTwoFaBusy] = useState(false);
  const [setupQr, setSetupQr] = useState<string | null>(null);
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [enableCode, setEnableCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");

  async function loadUser() {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    if (data.user) setUser(data.user);
  }

  useEffect(() => {
    loadUser().catch(() => setError(t("loadError")));
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

  async function startTwoFaSetup() {
    setTwoFaError("");
    setTwoFaMsg("");
    setTwoFaBusy(true);
    try {
      const res = await fetch("/api/auth/2fa");
      const data = await res.json();
      if (!res.ok) {
        setTwoFaError(data.error || t("saveError"));
        return;
      }
      if (data.enabled) {
        await loadUser();
        setTwoFaMsg(t("twoFactorAlreadyOn"));
        return;
      }
      setSetupQr(data.qrDataUrl);
      setSetupSecret(data.secret);
    } catch {
      setTwoFaError(t("saveError"));
    } finally {
      setTwoFaBusy(false);
    }
  }

  async function confirmTwoFaEnable(e: React.FormEvent) {
    e.preventDefault();
    setTwoFaError("");
    setTwoFaMsg("");
    setTwoFaBusy(true);
    try {
      const res = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: enableCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTwoFaError(data.error || t("saveError"));
        return;
      }
      setSetupQr(null);
      setSetupSecret(null);
      setEnableCode("");
      setTwoFaMsg(t("twoFactorEnabled"));
      await loadUser();
    } catch {
      setTwoFaError(t("saveError"));
    } finally {
      setTwoFaBusy(false);
    }
  }

  async function disableTwoFa(e: React.FormEvent) {
    e.preventDefault();
    setTwoFaError("");
    setTwoFaMsg("");
    setTwoFaBusy(true);
    try {
      const res = await fetch("/api/auth/2fa", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: disablePassword,
          code: disableCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTwoFaError(data.error || t("saveError"));
        return;
      }
      setDisablePassword("");
      setDisableCode("");
      setTwoFaMsg(t("twoFactorDisabled"));
      await loadUser();
    } catch {
      setTwoFaError(t("saveError"));
    } finally {
      setTwoFaBusy(false);
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
          <p className="mt-2 text-sm">
            {t("twoFactorStatus")}:{" "}
            <strong className={user.totpEnabled ? "text-green-700" : "text-amber-700"}>
              {user.totpEnabled ? t("twoFactorOn") : t("twoFactorOff")}
            </strong>
          </p>
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

      <section className="mt-6 max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
        <h2 className="text-lg font-semibold text-dark-blue">{t("twoFactorTitle")}</h2>
        <p className="text-sm text-gray-600">{t("twoFactorHelp")}</p>

        {twoFaError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {twoFaError}
          </div>
        )}
        {twoFaMsg && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {twoFaMsg}
          </div>
        )}

        {!user?.totpEnabled && !setupQr && (
          <button
            type="button"
            disabled={twoFaBusy}
            onClick={startTwoFaSetup}
            className="admin-btn admin-btn-primary disabled:opacity-60"
          >
            {twoFaBusy ? t("loginLoading") : t("twoFactorEnable")}
          </button>
        )}

        {!user?.totpEnabled && setupQr && (
          <form onSubmit={confirmTwoFaEnable} className="space-y-4">
            <div className="flex justify-center rounded-lg border border-gray-100 bg-gray-50 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={setupQr} alt={t("twoFactorQrAlt")} width={220} height={220} />
            </div>
            {setupSecret && (
              <p className="break-all text-xs text-gray-500">
                {t("twoFactorManualKey")}: <code>{setupSecret}</code>
              </p>
            )}
            <div>
              <label className="admin-label" htmlFor="enableCode">
                {t("twoFactorCode")}
              </label>
              <input
                id="enableCode"
                type="text"
                inputMode="numeric"
                required
                maxLength={8}
                className="admin-input tracking-widest"
                value={enableCode}
                onChange={(e) => setEnableCode(e.target.value)}
                placeholder="000000"
                autoComplete="one-time-code"
              />
            </div>
            <button
              type="submit"
              disabled={twoFaBusy}
              className="admin-btn admin-btn-primary disabled:opacity-60"
            >
              {twoFaBusy ? t("loginLoading") : t("twoFactorConfirm")}
            </button>
          </form>
        )}

        {user?.totpEnabled && (
          <form onSubmit={disableTwoFa} className="space-y-4">
            <p className="text-sm text-green-800">{t("twoFactorOnHint")}</p>
            <div>
              <label className="admin-label" htmlFor="disablePassword">
                {t("currentPassword")}
              </label>
              <input
                id="disablePassword"
                type="password"
                required
                className="admin-input"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="disableCode">
                {t("twoFactorCode")}
              </label>
              <input
                id="disableCode"
                type="text"
                inputMode="numeric"
                required
                maxLength={8}
                className="admin-input tracking-widest"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value)}
                placeholder="000000"
                autoComplete="one-time-code"
              />
            </div>
            <button
              type="submit"
              disabled={twoFaBusy}
              className="admin-btn border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60"
            >
              {twoFaBusy ? t("loginLoading") : t("twoFactorDisable")}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

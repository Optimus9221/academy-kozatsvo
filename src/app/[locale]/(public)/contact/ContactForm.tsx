"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { TurnstileWidget, isCaptchaConfiguredForClient } from "@/components/forms/TurnstileWidget";
import { MathCaptcha, type MathCaptchaValue } from "@/components/forms/MathCaptcha";
import { apiLocaleHeaders } from "@/lib/client-api";

const MESSAGE_MIN = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const locale = useLocale();
  const t = useTranslations("contact");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [mathCaptcha, setMathCaptcha] = useState<MathCaptchaValue>({ token: "", answer: "" });
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateForm(): string | null {
    if (!form.fullName.trim()) return tErrors("invalidField", { field: t("fullName") });
    if (!form.email.trim()) return tErrors("invalidField", { field: t("email") });
    if (!EMAIL_RE.test(form.email.trim())) return tErrors("invalidEmail");
    if (!form.message.trim()) return tErrors("invalidField", { field: t("message") });
    if (form.message.trim().length < MESSAGE_MIN) {
      return tErrors("messageMinLength", { min: MESSAGE_MIN });
    }
    if (isCaptchaConfiguredForClient()) {
      if (!turnstileToken) return tErrors("captchaRobot");
    } else if (!mathCaptcha.answer.trim()) {
      return tErrors("captchaWrongAnswer");
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...apiLocaleHeaders(locale),
        },
        body: JSON.stringify({
          ...form,
          turnstileToken: isCaptchaConfiguredForClient() ? turnstileToken : undefined,
          captchaToken: isCaptchaConfiguredForClient() ? undefined : mathCaptcha.token,
          captchaAnswer: isCaptchaConfiguredForClient() ? undefined : mathCaptcha.answer,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || tErrors("generic"));
        return;
      }
      setSuccess(true);
    } catch {
      setError(tErrors("generic"));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <>
        <PageHero title={t("successTitle")} />
        <section className="py-16">
          <div className="mx-auto max-w-lg px-4 text-center">
            <div className="rounded-xl bg-white p-8 shadow-md">
              <div className="text-5xl">✅</div>
              <h2 className="mt-4 text-2xl font-bold text-dark-blue">{t("thanks")}</h2>
              <p className="mt-2 text-text-muted">{t("successText")}</p>
              <div className="mt-6">
                <Link href="/" className="admin-btn admin-btn-primary inline-block">
                  {tCommon("home")}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <section className="py-16">
        <div className="mx-auto max-w-2xl px-4 lg:px-8">
          <form noValidate onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-8 shadow-md">
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
            )}

            <div>
              <label className="admin-label" htmlFor="fullName">{t("fullName")} *</label>
              <input
                id="fullName"
                className="admin-input"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="admin-label" htmlFor="email">{t("email")} *</label>
                <input
                  id="email"
                  type="email"
                  className="admin-input"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
              <div>
                <label className="admin-label" htmlFor="phone">{t("phone")}</label>
                <input
                  id="phone"
                  type="tel"
                  className="admin-input"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="admin-label" htmlFor="subject">{t("subject")}</label>
              <input
                id="subject"
                className="admin-input"
                value={form.subject}
                onChange={(e) => update("subject", e.target.value)}
              />
            </div>

            <div>
              <label className="admin-label" htmlFor="message">{t("message")} *</label>
              <textarea
                id="message"
                rows={6}
                className="admin-input"
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
              />
              <p className="mt-1 text-xs text-text-muted">{t("messageHint", { min: MESSAGE_MIN })}</p>
            </div>

            {isCaptchaConfiguredForClient() ? (
              <TurnstileWidget onSuccess={setTurnstileToken} />
            ) : (
              <MathCaptcha onChange={setMathCaptcha} />
            )}

            <button type="submit" disabled={loading} className="admin-btn admin-btn-primary w-full py-3">
              {loading ? t("submitting") : t("submit")}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

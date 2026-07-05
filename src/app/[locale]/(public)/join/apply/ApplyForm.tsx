"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { TurnstileWidget, isCaptchaConfiguredForClient } from "@/components/forms/TurnstileWidget";
import { MathCaptcha, type MathCaptchaValue } from "@/components/forms/MathCaptcha";

const STEPS = 3;
const DRAFT_STORAGE_KEY = "join-apply-draft";

const emptyFormData = {
  fullName: "",
  phone: "",
  email: "",
  city: "",
  country: "",
  motivationText: "",
  consent: false,
};

export function ApplyForm() {
  const t = useTranslations("join");
  const tCommon = useTranslations("common");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [mathCaptcha, setMathCaptcha] = useState<MathCaptchaValue>({ token: "", answer: "" });
  const [draftReady, setDraftReady] = useState(false);
  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { formData?: typeof emptyFormData; step?: number };
        if (saved.formData) setFormData({ ...emptyFormData, ...saved.formData });
        if (saved.step && saved.step >= 1 && saved.step <= STEPS) setStep(saved.step);
      }
    } catch {
      // ignore corrupted draft
    }
    setDraftReady(true);
  }, []);

  useEffect(() => {
    if (!draftReady || success) return;
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ formData, step }));
    } catch {
      // ignore quota errors
    }
  }, [formData, step, draftReady, success]);

  function update(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < STEPS) {
      setStep((s) => s + 1);
      return;
    }

    setLoading(true);
    setError("");

    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (k === "consent") fd.set(k, v ? "true" : "false");
      else fd.set(k, String(v));
    });
    const fileInput = document.getElementById("file") as HTMLInputElement;
    if (fileInput?.files?.[0]) fd.set("file", fileInput.files[0]);
    if (isCaptchaConfiguredForClient()) {
      if (turnstileToken) fd.set("cf-turnstile-response", turnstileToken);
    } else {
      fd.set("captchaToken", mathCaptcha.token);
      fd.set("captchaAnswer", mathCaptcha.answer);
    }

    try {
      const res = await fetch("/api/join/applications", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || tCommon("required"));
        return;
      }
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      setSuccess(true);
    } catch {
      setError(tCommon("required"));
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
              <p className="mt-2 text-sm text-text-muted">{t("emailConfirmHint")}</p>
              <div className="mt-6">
                <Button href="/" variant="secondary">
                  {t("homeBtn")}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  const stepLabels = [t("stepContact"), t("stepMotivation"), t("stepConfirm")];

  return (
    <>
      <PageHero title={t("applyTitle")} subtitle={t("applySubtitle")} />
      <section className="py-16">
        <div className="mx-auto max-w-2xl px-4 lg:px-8">
          <div
            className="mb-8 flex gap-2"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={STEPS}
            aria-valuenow={step}
            aria-label={t("applyTitle")}
          >
            {stepLabels.map((label, i) => (
              <div
                key={label}
                aria-current={i + 1 === step ? "step" : undefined}
                className={`flex-1 rounded-lg py-2 text-center text-xs font-medium sm:text-sm ${
                  i + 1 === step
                    ? "bg-ukraine-blue text-white"
                    : i + 1 < step
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-500"
                }`}
              >
                {i + 1}. {label}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-8 shadow-md">
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
            )}

            {step === 1 && (
              <>
                <div>
                  <label className="admin-label" htmlFor="fullName">{t("fullName")} *</label>
                  <input
                    id="fullName"
                    required
                    className="admin-input"
                    value={formData.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                  />
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="admin-label" htmlFor="phone">{t("phone")} *</label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      className="admin-input"
                      value={formData.phone}
                      onChange={(e) => update("phone", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="admin-label" htmlFor="email">{t("email")} *</label>
                    <input
                      id="email"
                      type="email"
                      required
                      className="admin-input"
                      value={formData.email}
                      onChange={(e) => update("email", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="admin-label" htmlFor="city">{t("city")} *</label>
                    <input
                      id="city"
                      required
                      className="admin-input"
                      value={formData.city}
                      onChange={(e) => update("city", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="admin-label" htmlFor="country">{t("country")} *</label>
                    <input
                      id="country"
                      required
                      className="admin-input"
                      value={formData.country}
                      onChange={(e) => update("country", e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="admin-label" htmlFor="motivationText">{t("motivation")} *</label>
                  <textarea
                    id="motivationText"
                    required
                    minLength={50}
                    rows={6}
                    className="admin-input"
                    value={formData.motivationText}
                    onChange={(e) => update("motivationText", e.target.value)}
                  />
                </div>
                <div>
                  <label className="admin-label" htmlFor="file">{t("file")}</label>
                  <input id="file" type="file" accept=".pdf,.jpg,.jpeg,.png" className="admin-input" />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="rounded-lg bg-gray-50 p-4 text-sm text-text-muted">
                  <p><strong>{formData.fullName}</strong></p>
                  <p>{formData.email} · {formData.phone}</p>
                  <p>{formData.city}, {formData.country}</p>
                </div>
                <div className="flex items-start gap-3">
                  <input
                    id="consent"
                    type="checkbox"
                    required
                    checked={formData.consent}
                    onChange={(e) => update("consent", e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="consent" className="text-sm text-text-muted">
                    {t("consent")}{" "}
                    <Link
                      href="/legal/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ukraine-blue underline"
                    >
                      {t("consentLink")}
                    </Link>
                    *
                  </label>
                </div>
                {isCaptchaConfiguredForClient() ? (
                  <TurnstileWidget onSuccess={setTurnstileToken} />
                ) : (
                  <MathCaptcha onChange={setMathCaptcha} />
                )}
              </>
            )}

            <div className="flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="admin-btn flex-1"
                >
                  ← {tCommon("back")}
                </button>
              )}
              <button type="submit" disabled={loading} className="admin-btn admin-btn-primary flex-1 py-3">
                {loading ? t("submitting") : step < STEPS ? t("nextStep") : t("submit")}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

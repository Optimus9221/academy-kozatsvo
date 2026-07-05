"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { apiLocaleHeaders } from "@/lib/client-api";

export type MathCaptchaValue = {
  token: string;
  answer: string;
};

export function MathCaptcha({
  onChange,
}: {
  onChange: (value: MathCaptchaValue) => void;
}) {
  const t = useTranslations("common");
  const locale = useLocale();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [question, setQuestion] = useState("");
  const [token, setToken] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);

  const loadChallenge = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/captcha", { headers: apiLocaleHeaders(locale) });
      const data = (await res.json()) as { token?: string; question?: string };
      if (data.token && data.question) {
        setToken(data.token);
        setQuestion(data.question);
        setAnswer("");
        onChangeRef.current({ token: data.token, answer: "" });
      }
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    loadChallenge();
  }, [loadChallenge]);

  function handleAnswerChange(value: string) {
    setAnswer(value);
    onChangeRef.current({ token, answer: value });
  }

  if (loading && !question) {
    return <p className="text-sm text-text-muted">{t("loading")}</p>;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <label className="admin-label" htmlFor="math-captcha">
        {t("captchaLabel", { question })}
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="math-captcha"
          type="number"
          inputMode="numeric"
          className="admin-input max-w-[8rem]"
          value={answer}
          onChange={(e) => handleAnswerChange(e.target.value)}
          placeholder={t("captchaPlaceholder")}
          aria-label={t("captchaLabel", { question })}
        />
        <button
          type="button"
          onClick={loadChallenge}
          className="admin-btn shrink-0 px-3"
          title={t("captchaRefresh")}
        >
          ↻
        </button>
      </div>
    </div>
  );
}

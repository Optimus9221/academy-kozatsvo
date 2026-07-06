"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { apiLocaleHeaders } from "@/lib/client-api";

export type MathCaptchaValue = {
  token: string;
  answer: string;
};

type CaptchaChallenge = {
  token?: string;
  question?: string;
};

export function MathCaptcha({
  onChange,
}: {
  onChange: (value: MathCaptchaValue) => void;
}) {
  const t = useTranslations("common");
  const locale = useLocale();
  const onChangeRef = useRef(onChange);
  const [question, setQuestion] = useState("");
  const [token, setToken] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const applyChallenge = useCallback((data: CaptchaChallenge) => {
    if (data.token && data.question) {
      setToken(data.token);
      setQuestion(data.question);
      setAnswer("");
      onChangeRef.current({ token: data.token, answer: "" });
    }
  }, []);

  const fetchChallenge = useCallback(async () => {
    const res = await fetch("/api/captcha", { headers: apiLocaleHeaders(locale) });
    return (await res.json()) as CaptchaChallenge;
  }, [locale]);

  useEffect(() => {
    let cancelled = false;

    fetchChallenge()
      .then((data) => {
        if (!cancelled) applyChallenge(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [applyChallenge, fetchChallenge]);

  async function refreshChallenge() {
    setLoading(true);
    try {
      const data = await fetchChallenge();
      applyChallenge(data);
    } finally {
      setLoading(false);
    }
  }

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
          onClick={refreshChallenge}
          className="admin-btn shrink-0 px-3"
          title={t("captchaRefresh")}
        >
          ↻
        </button>
      </div>
    </div>
  );
}

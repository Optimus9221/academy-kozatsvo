"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const COOKIE_KEY = "academy_cookie_consent";

let listeners: Array<() => void> = [];

function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

function getConsentNeeded() {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(COOKIE_KEY);
}

function notify() {
  listeners.forEach((l) => l());
}

export function CookieConsent() {
  const t = useTranslations("cookie");
  const visible = useSyncExternalStore(subscribe, getConsentNeeded, () => false);

  function accept() {
    localStorage.setItem(COOKIE_KEY, "accepted");
    notify();
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1200] border-t border-white/10 bg-dark-blue p-4 shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-blue-100">
          {t("message")}{" "}
          <Link href="/legal/privacy" className="text-ukraine-yellow underline hover:text-white">
            {t("privacyLink")}
          </Link>
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 rounded-lg bg-ukraine-yellow px-6 py-2 text-sm font-semibold text-dark-blue transition hover:bg-yellow-400"
        >
          {t("accept")}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function SiteSearch() {
  const t = useTranslations("common");
  const router = useRouter();
  const [q, setQ] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="hidden items-center md:flex">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("search")}
        className="w-36 rounded-l-lg border-0 bg-white/10 px-3 py-1.5 text-sm text-white placeholder:text-blue-200 focus:bg-white/20 focus:outline-none lg:w-44"
      />
      <button
        type="submit"
        className="rounded-r-lg bg-ukraine-yellow px-2.5 py-1.5 text-sm font-semibold text-dark-blue hover:bg-yellow-300"
        aria-label={t("search")}
      >
        🔍
      </button>
    </form>
  );
}

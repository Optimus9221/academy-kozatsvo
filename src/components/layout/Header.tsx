"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

interface HeaderProps {
  siteName: string;
  logoUrl?: string | null;
}

export function Header({ siteName, logoUrl }: HeaderProps) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("admin");
  const tMeta = useTranslations("meta");
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/about", label: t("about") },
    { href: "/news", label: t("news") },
    { href: "/gallery", label: t("gallery") },
    { href: "/leadership", label: t("leadership") },
    {
      href: "/branches/ukraine",
      label: t("branches"),
      children: [
        { href: "/branches/ukraine", label: t("branchesUkraine") },
        { href: "/branches/international", label: t("branchesIntl") },
      ],
    },
    { href: "/partners", label: t("partners") },
  ];

  return (
    <header className="sticky top-0 z-[1100] isolate bg-dark-blue pt-[env(safe-area-inset-top)] text-white shadow-lg transform-gpu">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={siteName}
              className="h-12 w-12 shrink-0 object-contain"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ukraine-yellow text-sm font-bold text-dark-blue">
              {tMeta("siteAbbr")}
            </div>
          )}
          <div className="hidden sm:block">
            <div className="text-sm font-bold leading-tight">{siteName}</div>
            <div className="text-xs text-blue-200">{t("officialSite")}</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-4 lg:flex">
          {navLinks.map((link) => (
            <div key={link.href} className="group relative">
              <Link
                href={link.href}
                className="text-sm font-medium text-white/90 transition hover:text-ukraine-yellow"
              >
                {link.label}
              </Link>
              {link.children && (
                <div className="invisible absolute left-0 top-full z-50 min-w-[180px] rounded-lg bg-white py-2 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block px-4 py-2 text-sm text-dark-blue hover:bg-blue-50"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <LanguageSwitcher compact />
          <Button href="/admin/login" variant="outline" size="sm">
            {tAdmin("loginBtn")}
          </Button>
          <Button href="/join/apply" variant="primary" size="sm">
            {tCommon("joinBtn")}
          </Button>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher compact />
          <button
            className="rounded-lg p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-dark-blue px-4 py-4 lg:hidden">
          {navLinks.map((link) => (
            <div key={link.href}>
              <Link
                href={link.href}
                className="block py-2 text-sm font-medium text-white/90"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
              {link.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className="block py-1 pl-4 text-sm text-white/70"
                  onClick={() => setMobileOpen(false)}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          ))}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button href="/admin/login" variant="outline" size="sm">
              {tAdmin("loginBtn")}
            </Button>
            <Button href="/join/apply" variant="primary" size="sm">
              {tCommon("joinBtn")}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

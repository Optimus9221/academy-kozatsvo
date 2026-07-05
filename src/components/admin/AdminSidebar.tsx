"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { SessionUser } from "@/lib/auth";
import { AdminLanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export function AdminSidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("admin");
  const tRoles = useTranslations("roles");

  const navItems = [
    { href: "/admin", label: t("dashboard"), icon: "📊" },
    { href: "/admin/news", label: t("news"), icon: "📰", roles: ["ADMIN", "EDITOR"] },
    { href: "/admin/gallery", label: t("gallery"), icon: "🖼️", roles: ["ADMIN", "EDITOR"] },
    { href: "/admin/leadership", label: t("leadership"), icon: "👤", roles: ["ADMIN", "EDITOR"] },
    { href: "/admin/branches/ukraine", label: t("branchesUa"), icon: "🇺🇦", roles: ["ADMIN", "EDITOR"] },
    { href: "/admin/branches/international", label: t("branchesIntl"), icon: "🌍", roles: ["ADMIN", "EDITOR"] },
    { href: "/admin/partners", label: t("partners"), icon: "🤝", roles: ["ADMIN", "EDITOR"] },
    { href: "/admin/join/rules", label: t("joinRules"), icon: "📋", roles: ["ADMIN", "EDITOR"] },
    { href: "/admin/applications", label: t("applications"), icon: "📝", roles: ["ADMIN", "MODERATOR"] },
    { href: "/admin/settings", label: t("settings"), icon: "⚙️", roles: ["ADMIN"] },
  ];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );

  return (
    <aside className="flex w-64 flex-col bg-dark-blue text-white">
      <div className="border-b border-white/10 p-6">
        <Link href="/admin" className="text-lg font-bold text-ukraine-yellow">
          {t("panel")}
        </Link>
        <p className="mt-1 text-xs text-blue-200">{user.name}</p>
        <p className="text-xs text-blue-300">{tRoles(user.role)}</p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {visibleItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "bg-ukraine-blue text-white"
                  : "text-blue-200 hover:bg-white/10"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <AdminLanguageSwitcher />

      <div className="space-y-2 border-t border-white/10 p-4">
        <Link
          href="/"
          target="_blank"
          className="block rounded-lg px-3 py-2 text-sm text-blue-200 hover:bg-white/10"
        >
          🌐 {t("openSite")}
        </Link>
        <button
          onClick={logout}
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-white/10"
        >
          🚪 {t("logout")}
        </button>
      </div>
    </aside>
  );
}

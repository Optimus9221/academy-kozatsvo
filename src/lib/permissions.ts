import type { UserRole } from "@/generated/prisma/client";

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Адміністратор",
  EDITOR: "Редактор",
  MODERATOR: "Модератор",
};

export function canManageContent(role: UserRole): boolean {
  return role === "ADMIN" || role === "EDITOR";
}

export function canManageApplications(role: UserRole): boolean {
  return role === "ADMIN" || role === "MODERATOR";
}

export function canManageSettings(role: UserRole): boolean {
  return role === "ADMIN";
}

export function canManageUsers(role: UserRole): boolean {
  return role === "ADMIN";
}

const MODERATOR_ALLOWED_PREFIXES = [
  "/admin/applications",
  "/admin/contact",
  "/admin/account",
];
const EDITOR_DENIED_PREFIXES = [
  "/admin/settings",
  "/admin/users",
  "/admin/audit",
];

/** Normalized admin subpath without locale, e.g. "news/1" or "" for dashboard */
export function normalizeAdminSubPath(subPath: string): string {
  const trimmed = subPath.replace(/\/$/, "");
  return trimmed ? `/admin/${trimmed}` : "/admin";
}

export function canAccessAdminPath(role: UserRole, subPath: string): boolean {
  const path = normalizeAdminSubPath(subPath);

  if (role === "ADMIN") return true;

  if (role === "MODERATOR") {
    return MODERATOR_ALLOWED_PREFIXES.some(
      (allowed) => path === allowed || path.startsWith(`${allowed}/`)
    );
  }

  if (role === "EDITOR") {
    return !EDITOR_DENIED_PREFIXES.some(
      (denied) => path === denied || path.startsWith(`${denied}/`)
    );
  }

  return false;
}

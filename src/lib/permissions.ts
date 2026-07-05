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

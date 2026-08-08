import nodemailer from "nodemailer";
import type { ApplicationStatus } from "@/generated/prisma/client";

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  NEW: "Нова",
  IN_PROGRESS: "В обробці",
  APPROVED: "Схвалено",
  REJECTED: "Відхилено",
};

/** Where security / login alerts are sent. Can change via SECURITY_NOTIFY_EMAIL. */
export function getSecurityNotifyEmail(): string {
  return (
    process.env.SECURITY_NOTIFY_EMAIL ||
    process.env.NOTIFY_EMAIL ||
    "aleksandrsqvr@gmail.com"
  );
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

export async function sendApplicationNotification(data: {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  motivationText: string;
  applicationId: string;
}) {
  const to =
    process.env.NOTIFY_EMAIL ||
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    getSecurityNotifyEmail();
  if (!to) return;

  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[email] SMTP not configured, skipping notification");
    return;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || to;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  await transporter.sendMail({
    from,
    to,
    subject: `[МАК] Нова заявка: ${data.fullName}`,
    text: [
      "Нова заявка на вступ до Міжнародної Академії Козацтва",
      "",
      `ПІБ: ${data.fullName}`,
      `Email: ${data.email}`,
      `Телефон: ${data.phone}`,
      `Місто: ${data.city}`,
      `Країна: ${data.country}`,
      "",
      "Мотивація:",
      data.motivationText,
      "",
      `ID: ${data.applicationId}`,
      `Адмінка: ${siteUrl}/uk/admin/applications`,
    ].join("\n"),
  });
}

export async function sendApplicationConfirmation(data: {
  fullName: string;
  email: string;
}) {
  const transporter = getTransporter();
  if (!transporter) return;

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.NOTIFY_EMAIL;
  if (!from) return;

  await transporter.sendMail({
    from,
    to: data.email,
    subject: "МАК — заявку отримано",
    text: [
      `Шановний(а) ${data.fullName},`,
      "",
      "Дякуємо за заявку на вступ до Міжнародної Академії Козацтва (МАК).",
      "Ми розглянемо її протягом 14 днів і повідомимо вас на email.",
      "",
      "Слава Україні!",
      "Міжнародна Академія Козацтва",
    ].join("\n"),
  });
}

export async function sendApplicationStatusUpdate(data: {
  fullName: string;
  email: string;
  status: ApplicationStatus;
  moderatorNote?: string | null;
}) {
  const transporter = getTransporter();
  if (!transporter) return;

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.NOTIFY_EMAIL;
  if (!from) return;

  const statusLabel = STATUS_LABELS[data.status];
  const lines = [
    `Шановний(а) ${data.fullName},`,
    "",
    "Статус вашої заявки на вступ до Міжнародної Академії Козацтва (МАК) оновлено.",
    "",
    `Новий статус: ${statusLabel}`,
  ];

  if (data.moderatorNote?.trim()) {
    lines.push("", "Коментар модератора:", data.moderatorNote.trim());
  }

  lines.push("", "Слава Україні!", "Міжнародна Академія Козацтва");

  await transporter.sendMail({
    from,
    to: data.email,
    subject: `МАК — статус заявки: ${statusLabel}`,
    text: lines.join("\n"),
  });
}

export type LoginAlertKind = "success" | "failed" | "failed_2fa" | "rate_limited";

export async function sendLoginAlert(data: {
  kind: LoginAlertKind;
  accountEmail?: string | null;
  accountName?: string | null;
  ip: string;
  userAgent?: string | null;
  when?: Date;
  detail?: string | null;
}) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[email] SMTP not configured, skipping login alert");
    return;
  }

  const to = getSecurityNotifyEmail();
  const from =
    process.env.SMTP_FROM || process.env.SMTP_USER || to;
  if (!from) return;

  const when = data.when || new Date();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const titles: Record<LoginAlertKind, string> = {
    success: "Успішний вхід в адмінку",
    failed: "Невдала спроба входу",
    failed_2fa: "Невдала спроба 2FA",
    rate_limited: "Перевищено ліміт спроб входу",
  };

  await transporter.sendMail({
    from,
    to,
    subject: `[МАК Security] ${titles[data.kind]}`,
    text: [
      `Подія: ${titles[data.kind]}`,
      "",
      `Час: ${when.toISOString()}`,
      `Акаунт: ${data.accountEmail || "невідомо"}`,
      `Ім'я: ${data.accountName || "—"}`,
      `IP: ${data.ip}`,
      `Пристрій: ${data.userAgent?.slice(0, 200) || "невідомо"}`,
      data.detail ? `Деталі: ${data.detail}` : null,
      "",
      `Адмінка: ${siteUrl}/uk/admin/login`,
      `Журнал: ${siteUrl}/uk/admin/audit`,
      "",
      "Якщо це були не ви — змініть паролі й перевірте 2FA.",
      "Міжнародна Академія Козацтва",
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

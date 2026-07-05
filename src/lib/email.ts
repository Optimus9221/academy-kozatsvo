import nodemailer from "nodemailer";

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
    process.env.SMTP_USER;
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

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const SOCIAL_ICONS: Record<string, string> = {
  youtube: "▶️",
  facebook: "📘",
  instagram: "📷",
  telegram: "✈️",
};

function phoneToTel(phone: string): string {
  const first = phone.split(/[,;\n]/)[0]?.trim() || phone;
  return `tel:${first.replace(/[^\d+]/g, "")}`;
}

interface FooterProps {
  siteName: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactAddress?: string | null;
  socialLinks?: Record<string, string>;
}

export async function Footer({
  siteName,
  contactEmail,
  contactPhone,
  contactAddress,
  socialLinks = {},
}: FooterProps) {
  const t = await getTranslations("footer");

  return (
    <footer className="mt-auto bg-dark-blue text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3 lg:px-8">
        <div>
          <h3 className="mb-4 text-lg font-bold text-ukraine-yellow">{siteName}</h3>
          <p className="text-sm text-blue-200">{t("tagline")}</p>
          {Object.keys(socialLinks).length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {Object.entries(socialLinks).map(([key, url]) =>
                url ? (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-xl transition hover:bg-ukraine-yellow hover:text-dark-blue"
                    title={key}
                  >
                    {SOCIAL_ICONS[key] || "🔗"}
                  </a>
                ) : null
              )}
            </div>
          )}
        </div>

        <div>
          <h4 className="mb-4 font-semibold">{t("contacts")}</h4>
          <ul className="space-y-2 text-sm text-blue-200">
            {contactEmail && (
              <li>
                <a href={`mailto:${contactEmail}`} className="hover:text-white">
                  {contactEmail}
                </a>
              </li>
            )}
            {contactPhone && (
              <li>
                <a href={phoneToTel(contactPhone)} className="whitespace-pre-line hover:text-white">
                  {contactPhone.replace(/,\s*/g, "\n")}
                </a>
              </li>
            )}
            {contactAddress && <li>{contactAddress}</li>}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold">{t("links")}</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/join/faq" className="text-blue-200 hover:text-white">
                {t("faq")}
              </Link>
            </li>
            <li>
              <Link href="/join/rules" className="text-blue-200 hover:text-white">
                {t("joinRules")}
              </Link>
            </li>
            <li>
              <Link href="/about/documents" className="text-blue-200 hover:text-white">
                {t("documents")}
              </Link>
            </li>
            <li>
              <Link href="/legal/privacy" className="text-blue-200 hover:text-white">
                {t("privacy")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-blue-300">
        © {new Date().getFullYear()} {siteName}. {t("copyright")}
      </div>
    </footer>
  );
}

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

export default async function NotFoundPage() {
  const t = await getTranslations("common");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-8xl font-bold text-ukraine-blue/20">404</p>
      <h1 className="mt-4 text-3xl font-bold text-dark-blue">{t("notFound")}</h1>
      <p className="mt-2 text-text-muted">404</p>
      <div className="mt-8">
        <Button href="/" variant="primary">
          {t("back")}
        </Button>
      </div>
    </div>
  );
}

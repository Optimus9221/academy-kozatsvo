import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { getSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    const locale = await getLocale();
    redirect({ href: "/admin/login", locale });
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar user={session} />
      <div className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}

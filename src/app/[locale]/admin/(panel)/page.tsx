import { prisma } from "@/lib/db";
import { Link } from "@/i18n/navigation";

export default async function AdminDashboard() {
  const [newsCount, appsCount, branchesCount, partnersCount] = await Promise.all([
    prisma.news.count(),
    prisma.application.count({ where: { status: "NEW" } }),
    prisma.branch.count(),
    prisma.partner.count(),
  ]);

  const recentApps = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const stats = [
    { label: "Новин", value: newsCount, href: "/admin/news", color: "bg-blue-500" },
    { label: "Нових заявок", value: appsCount, href: "/admin/applications", color: "bg-yellow-500" },
    { label: "Представництв", value: branchesCount, href: "/admin/branches/ukraine", color: "bg-green-500" },
    { label: "Партнерів", value: partnersCount, href: "/admin/partners", color: "bg-purple-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark-blue">Дашборд</h1>
      <p className="mt-1 text-text-muted">Огляд сайту Академії Козацтва</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl bg-white p-6 shadow-md transition hover:shadow-lg"
          >
            <div className={`inline-flex rounded-lg ${stat.color} px-3 py-1 text-2xl font-bold text-white`}>
              {stat.value}
            </div>
            <p className="mt-3 font-medium text-dark-blue">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-dark-blue">Останні заявки</h2>
          <Link href="/admin/applications" className="text-sm text-ukraine-blue hover:underline">
            Усі заявки →
          </Link>
        </div>
        {recentApps.length === 0 ? (
          <p className="text-sm text-text-muted">Заявок поки немає</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ПІБ</th>
                <th>Email</th>
                <th>Місто</th>
                <th>Статус</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {recentApps.map((app) => (
                <tr key={app.id}>
                  <td>{app.fullName}</td>
                  <td>{app.email}</td>
                  <td>{app.city}</td>
                  <td>{app.status}</td>
                  <td>{app.createdAt.toLocaleDateString("uk-UA")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

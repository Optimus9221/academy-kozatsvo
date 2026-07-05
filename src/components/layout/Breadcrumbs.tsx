import { Link } from "@/i18n/navigation";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-gray-300">/</span>}
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} className="text-ukraine-blue hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className={i === items.length - 1 ? "font-medium text-dark-blue" : ""}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

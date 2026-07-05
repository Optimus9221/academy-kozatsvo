"use client";

import { useRouter } from "next/navigation";

interface BranchFilterProps {
  regions?: string[];
  countries?: string[];
  currentRegion?: string;
  currentCountry?: string;
  basePath: string;
  filterLabel: string;
}

export function BranchFilter({
  regions,
  countries,
  currentRegion,
  currentCountry,
  basePath,
  filterLabel,
}: BranchFilterProps) {
  const router = useRouter();
  const options = regions || countries || [];
  const current = currentRegion || currentCountry || "";
  const param = regions ? "region" : "country";

  return (
    <div className="flex flex-wrap items-center gap-4">
      <label htmlFor="filter" className="text-sm font-medium text-dark-blue">
        {filterLabel}:
      </label>
      <select
        id="filter"
        value={current}
        onChange={(e) => {
          const value = e.target.value;
          router.push(value ? `${basePath}?${param}=${encodeURIComponent(value)}` : basePath);
        }}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-ukraine-blue focus:outline-none"
      >
        <option value="">Усі</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

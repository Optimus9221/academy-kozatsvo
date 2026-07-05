import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import { defaultLocale, locales } from "./locales";

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  localePrefix: "always",
  localeDetection: true,
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

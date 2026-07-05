import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/navigation";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { canAccessAdminPath } from "@/lib/permissions";
import { locales } from "@/i18n/locales";

const intlMiddleware = createMiddleware(routing);

const localePattern = locales.join("|");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminMatch = pathname.match(
    new RegExp(`^/(${localePattern})/admin(?:/(.*))?$`)
  );

  if (adminMatch) {
    const subPath = adminMatch[2] || "";
    const isLogin = subPath === "login" || subPath.startsWith("login");

    if (!isLogin) {
      const token = request.cookies.get(SESSION_COOKIE)?.value;
      if (!token) {
        const locale = adminMatch[1];
        return NextResponse.redirect(
          new URL(`/${locale}/admin/login`, request.url)
        );
      }
      const user = await verifySessionToken(token);
      if (!user) {
        const locale = adminMatch[1];
        const response = NextResponse.redirect(
          new URL(`/${locale}/admin/login`, request.url)
        );
        response.cookies.delete(SESSION_COOKIE);
        return response;
      }

      if (!canAccessAdminPath(user.role, subPath)) {
        const locale = adminMatch[1];
        const redirectPath =
          user.role === "MODERATOR"
            ? `/${locale}/admin/applications`
            : `/${locale}/admin`;
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }
  }

  if (pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/uk/admin", request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

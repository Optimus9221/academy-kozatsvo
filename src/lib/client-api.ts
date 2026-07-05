export function apiLocaleHeaders(locale: string): HeadersInit {
  return { "X-Locale": locale };
}

import slugifyLib from "slugify";

export function createSlug(text: string): string {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    locale: "uk",
  });
}

export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = createSlug(base);
  if (!slug) slug = "item";
  let candidate = slug;
  let i = 1;
  while (await exists(candidate)) {
    candidate = `${slug}-${i++}`;
  }
  return candidate;
}

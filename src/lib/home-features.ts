export type HomeFeature = {
  imageUrl: string;
  label: string;
};

export const DEFAULT_HOME_FEATURES: HomeFeature[] = [
  {
    imageUrl: "/images/news-conference.jpg",
    label: "Міжнародна спільнота",
  },
  {
    imageUrl: "/images/news-lviv-opening.jpg",
    label: "Збереження традицій",
  },
  {
    imageUrl: "/images/news-youth-camp.jpg",
    label: "Активна спільнота",
  },
  {
    imageUrl: "/images/leader-general.jpg",
    label: "Патріотизм та честь",
  },
];

export function parseHomeFeatures(json: string | null | undefined): HomeFeature[] {
  if (!json?.trim()) return [...DEFAULT_HOME_FEATURES];
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [...DEFAULT_HOME_FEATURES];
    }
    return parsed.slice(0, 4).map((item, index) => {
      const fallback = DEFAULT_HOME_FEATURES[index] || DEFAULT_HOME_FEATURES[0];
      if (!item || typeof item !== "object") return { ...fallback };
      const row = item as Record<string, unknown>;
      const imageUrl =
        typeof row.imageUrl === "string" && row.imageUrl.trim()
          ? row.imageUrl.trim()
          : typeof row.image === "string" && row.image.trim()
            ? row.image.trim()
            : fallback.imageUrl;
      const label =
        typeof row.label === "string" && row.label.trim()
          ? row.label.trim()
          : fallback.label;
      return { imageUrl, label };
    });
  } catch {
    return [...DEFAULT_HOME_FEATURES];
  }
}

export function normalizeHomeFeatures(
  input: unknown
): HomeFeature[] {
  if (!Array.isArray(input)) return [...DEFAULT_HOME_FEATURES];
  const next: HomeFeature[] = [];
  for (let i = 0; i < 4; i++) {
    const fallback = DEFAULT_HOME_FEATURES[i];
    const item = input[i];
    if (!item || typeof item !== "object") {
      next.push({ ...fallback });
      continue;
    }
    const row = item as Record<string, unknown>;
    next.push({
      imageUrl:
        typeof row.imageUrl === "string" && row.imageUrl.trim()
          ? row.imageUrl.trim()
          : fallback.imageUrl,
      label:
        typeof row.label === "string" && row.label.trim()
          ? row.label.trim()
          : fallback.label,
    });
  }
  return next;
}

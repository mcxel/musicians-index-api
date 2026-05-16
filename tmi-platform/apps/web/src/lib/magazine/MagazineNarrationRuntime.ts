import { getMagazineArticleBySlug } from "./MagazineArticleResolver";

export interface MagazineNarrationState {
  slug: string;
  enabled: boolean;
  voice: "editorial" | "news" | "feature";
  estimatedDurationSeconds: number;
}

function estimateDurationSeconds(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(12, Math.ceil(words / 2.8));
}

export function getMagazineNarrationState(slug: string): MagazineNarrationState | null {
  const article = getMagazineArticleBySlug(slug);
  if (!article) return null;

  return {
    slug,
    enabled: true,
    voice: article.category === "news" ? "news" : article.category === "feature" ? "feature" : "editorial",
    estimatedDurationSeconds: estimateDurationSeconds(article.body),
  };
}

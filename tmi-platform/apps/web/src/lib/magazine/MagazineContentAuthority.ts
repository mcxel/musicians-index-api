import { getMagazineArticleBySlug, type MagazineArticle } from "./MagazineArticleResolver";

export interface MagazineContentValidation {
  canPublish: boolean;
  canReward: boolean;
  reason: string;
}

export function validateMagazineArticle(article: MagazineArticle): MagazineContentValidation {
  if (!article.body.trim()) return { canPublish: false, canReward: false, reason: "missing-body" };
  if (!article.slug || !article.title) return { canPublish: false, canReward: false, reason: "missing-core-fields" };
  if (article.trustScore < 50) return { canPublish: false, canReward: false, reason: "trust-too-low" };
  if (article.minimumReadSeconds < 10) return { canPublish: false, canReward: false, reason: "invalid-read-threshold" };

  return {
    canPublish: true,
    canReward: article.monetized && article.payoutEligible,
    reason: "ok",
  };
}

export function resolveArticleAuthority(slug: string): {
  article: MagazineArticle | null;
  validation: MagazineContentValidation;
} {
  const article = getMagazineArticleBySlug(slug);
  if (!article) {
    return {
      article: null,
      validation: { canPublish: false, canReward: false, reason: "missing-article" },
    };
  }

  return {
    article,
    validation: validateMagazineArticle(article),
  };
}

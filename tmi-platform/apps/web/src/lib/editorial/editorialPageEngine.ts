// Editorial page engine — template resolution and body slicing authority.
import type { ArticleTemplate, ArticleCategory } from "./NewsArticleModel";

export function resolveTemplate(
  category: ArticleCategory,
  override?: ArticleTemplate
): ArticleTemplate {
  if (override) return override;
  switch (category) {
    case "artist":     return "A";
    case "performer":  return "A";
    case "interview":  return "E";
    case "news":       return "D";
    case "sponsor":    return "C";
    case "advertiser": return "B";
    default:           return "A";
  }
}

export function getTemplateLabel(template: ArticleTemplate): string {
  switch (template) {
    case "A": return "Standard Feature";
    case "B": return "Split Editorial Spread";
    case "C": return "Full Sponsor Ad";
    case "D": return "News Stack Feed";
    case "E": return "Interview Spread";
  }
}

export function sliceBodyParagraphs(
  body: string[],
  midPoint?: number
): { above: string[]; below: string[] } {
  const mid = midPoint ?? Math.ceil(body.length / 2);
  return { above: body.slice(0, mid), below: body.slice(mid) };
}

export function buildReadTime(body: string[]): string {
  const words = body.join(" ").split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

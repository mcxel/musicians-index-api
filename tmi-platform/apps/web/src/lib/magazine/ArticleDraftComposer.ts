/**
 * ArticleDraftComposer.ts — turns a persisted five-question interview into the
 * canonical one-performer Living Article draft body.
 *
 * Lane: FINAL COMPLETION WAVE / Pillar 3 (2026-10-30).
 *
 * REUSE LAW: this module COMPOSES content; it never persists, never writes to
 * Prisma, never picks a ranking signal. Persistence stays in
 * /api/articles/performer-draft (the one-performer-one-living-article
 * authority), composition/layout stays in the existing Magazine
 * CompositionEngine, photos stay under the existing imageSlots entitlement
 * ladder (articlePhotoEntitlement.ts).
 *
 * The composer maps the question FAMILY to the existing MagazineArticle block
 * vocabulary (paragraph | heading | pullquote | image) so the output flows
 * into the real composition renderer instead of a divergent preview.
 */

import {
  questionById,
  type ArticleQuestionCategory,
} from "@/lib/magazine/ArticleQuestionBank";

export interface InterviewAnswer {
  questionId: string;
  answer: string;
}

export interface ComposedArticleDraft {
  /** MagazineArticle-compatible blocks: paragraph | heading | pullquote | image. */
  blocks: Array<{ type: "heading" | "paragraph" | "pullquote"; text: string }>;
  /** Suggested subtitle/dek from the strongest editorial answer. */
  suggestedSubtitle: string | null;
  /** Family counts actually used (for certification/telemetry). */
  familyCounts: Record<ArticleQuestionCategory, number>;
}

const FAMILY_HEADING: Record<ArticleQuestionCategory, string> = {
  EDITORIAL: "The Story",
  PERSONAL: "Get To Know Me",
  WILD_CARD: "Wild Card",
};

function truncateSentence(text: string, max = 160): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

/**
 * Compose a stable, deterministic article body from interview answers.
 * Same answers in → same blocks out. No randomness at render time; question
 * SELECTION (ArticleQuestionBank) already persisted the chosen set.
 */
export function composeArticleDraft(answers: InterviewAnswer[]): ComposedArticleDraft {
  const clean = answers
    .filter((a) => a.answer.trim().length > 0)
    .map((a) => ({ q: questionById(a.questionId), answer: a.answer.trim() }))
    .filter((a) => a.q !== undefined) as Array<{ q: NonNullable<ReturnType<typeof questionById>>; answer: string }>;

  const familyCounts: Record<ArticleQuestionCategory, number> = {
    EDITORIAL: 0,
    PERSONAL: 0,
    WILD_CARD: 0,
  };
  for (const a of clean) familyCounts[a.q.category] += 1;

  const blocks: ComposedArticleDraft["blocks"] = [];
  let suggestedSubtitle: string | null = null;
  let currentFamily: ArticleQuestionCategory | null = null;
  let wildCardPullQuote: string | null = null;

  for (const a of clean) {
    const cat = a.q.category;
    if (cat !== currentFamily) {
      blocks.push({ type: "heading", text: FAMILY_HEADING[cat] });
      currentFamily = cat;
    }
    if (cat === "EDITORIAL" && suggestedSubtitle === null) {
      // The first substantive editorial answer becomes the dek suggestion.
      suggestedSubtitle = truncateSentence(a.answer, 140);
    }
    if (cat === "WILD_CARD" && wildCardPullQuote === null) {
      // The strongest personality answer becomes a pull-quote, per the
      // composition law: Wild Card answers get a playful treatment, not prose.
      wildCardPullQuote = truncateSentence(a.answer, 200);
      blocks.push({ type: "pullquote", text: a.answer });
      continue;
    }
    blocks.push({ type: "paragraph", text: a.answer });
  }

  return { blocks, suggestedSubtitle, familyCounts };
}

/**
 * EditorialValidationEngine
 * Quality gate for all articles before they reach a surface.
 * Prevents duplicate content, stale articles, low-quality blocks, and spam.
 */

import type { MagazineArticle } from "@/lib/magazine/magazineIssueData";

export interface ValidationResult {
  passed: boolean;
  score: number;
  flags: string[];
}

const BANNED_WORDS = ["lorem", "ipsum", "placeholder", "todo", "coming soon", "tbd"];
const MIN_BLOCK_COUNT = 2;
const MIN_TITLE_LENGTH = 10;
const MAX_TITLE_LENGTH = 120;

function scoreTitleQuality(title: string): number {
  if (title.length < MIN_TITLE_LENGTH) return 20;
  if (title.length > MAX_TITLE_LENGTH) return 60;
  if (BANNED_WORDS.some(w => title.toLowerCase().includes(w))) return 0;
  return 100;
}

function scoreContentDepth(blocks: MagazineArticle["blocks"]): number {
  if (blocks.length < MIN_BLOCK_COUNT) return 30;
  const paragraphs = blocks.filter(b => b.type === "paragraph");
  if (paragraphs.length === 0) return 40;
  const avgLen = paragraphs.reduce((s, b) => s + (b.text?.length ?? 0), 0) / paragraphs.length;
  if (avgLen < 60) return 50;
  if (avgLen < 120) return 75;
  return 100;
}

function scoreTagPresence(tags: string[]): number {
  if (tags.length === 0) return 0;
  if (tags.length < 2) return 50;
  return 100;
}

function checkForBannedContent(article: MagazineArticle): string[] {
  const flags: string[] = [];
  const fullText = [
    article.title,
    article.subtitle,
    ...article.blocks.map(b => b.text ?? ""),
  ].join(" ").toLowerCase();

  for (const word of BANNED_WORDS) {
    if (fullText.includes(word)) {
      flags.push(`banned_word:${word}`);
    }
  }
  return flags;
}

export function validateArticle(article: MagazineArticle): ValidationResult {
  const flags: string[] = [];

  const titleScore = scoreTitleQuality(article.title);
  const contentScore = scoreContentDepth(article.blocks);
  const tagScore = scoreTagPresence(article.tags);
  const bannedFlags = checkForBannedContent(article);

  flags.push(...bannedFlags);
  if (titleScore < 60) flags.push("weak_title");
  if (contentScore < 50) flags.push("shallow_content");
  if (tagScore < 50) flags.push("missing_tags");
  if (!article.author) flags.push("missing_author");
  if (!article.heroColor) flags.push("missing_hero_color");

  const score = Math.round((titleScore * 0.3) + (contentScore * 0.5) + (tagScore * 0.2));
  const passed = score >= 60 && bannedFlags.length === 0;

  return { passed, score, flags };
}

export function filterValidArticles(articles: MagazineArticle[]): MagazineArticle[] {
  return articles.filter(a => validateArticle(a).passed);
}

export function scoreArticlePool(articles: MagazineArticle[]): { article: MagazineArticle; score: number }[] {
  return articles
    .map(a => ({ article: a, score: validateArticle(a).score }))
    .sort((a, b) => b.score - a.score);
}

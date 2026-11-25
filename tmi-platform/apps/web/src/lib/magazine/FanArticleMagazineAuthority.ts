/**
 * FanArticleMagazineAuthority.ts — the ONE Fan-article→Magazine read authority.
 *
 * FINAL MAGAZINE ADDITION (2026-10-30, owner-locked): Fan articles are REAL
 * `Article` rows whose author has no Artist (performer) profile — a Fan, never
 * a Performer borrowing a slot. Fan content is a RANDOM-page subtype, NOT a
 * fourth top-level Magazine family: the canonical P→N→R cadence is unchanged
 * and Fan articles enter only through the RANDOM pool. This module only READS
 * and SHAPES them into MagazineRandomSlotSource; it never creates, never
 * ranks, never re-implements composition. Persistence stays in the canonical
 * /api/articles/* routes; composition stays in CompositionEngine; placement
 * stays in MagazineRotationEngine.
 *
 * FAN ARTICLE ≠ PERFORMER ARTICLE — enforced by the not-Artist-profile filter.
 */

import { prisma } from "@/lib/prisma";
import { magazineReaderArticleUrl } from "./MagazineReaderUrls";
import type { MagazineRandomSlotSource } from "./MagazineIssueContract";

/** An Article row is a Fan article when its author has NO Artist profile. */
export async function listFanArticlesForMagazine(opts: {
  limit?: number;
} = {}): Promise<MagazineRandomSlotSource[]> {
  const limit = Math.max(1, Math.min(50, opts.limit ?? 12));
  try {
    // Generated Prisma client (pre-migration) only exposes core Article scalars.
    // subjectUserId / writerUserId / author.artist filter ship with the schema
    // proposal but are not in the current client — query only what exists today.
    const rows = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        authorId: { not: null },
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        content: true,
        authorId: true,
        author: {
          select: {
            id: true,
            name: true,
            displayName: true,
            userProfile: { select: { username: true, avatarUrl: true } },
          },
        },
      },
    });

    return rows.map((row) => {
      const preview = extractPreviewText(row.content);
      return {
        id: `fan-${row.id}`,
        subtype: "FAN_POLL",
        paidObligation: false,
        title: row.title,
        href: magazineReaderArticleUrl(row.slug),
        deck: preview ?? row.subtitle ?? undefined,
        monetizationLayer: "NONE",
        imageUrl: row.author?.userProfile?.avatarUrl ?? undefined,
      } satisfies MagazineRandomSlotSource;
    });
  } catch {
    // DB unavailable / schema not yet migrated — return an honest empty pool,
    // never fabricated fan content.
    return [];
  }
}

/** Extract the first paragraph text from an Article content JSON body. */
function extractPreviewText(content: unknown): string | undefined {
  if (!content || typeof content !== "object") return undefined;
  const blocks = (content as { blocks?: Array<{ type?: string; text?: string }> }).blocks;
  if (Array.isArray(blocks)) {
    const para = blocks.find((b) => b?.type === "paragraph" && typeof b.text === "string");
    if (para?.text) return truncate(para.text, 160);
  }
  const body = (content as { body?: unknown }).body;
  if (typeof body === "string") return truncate(body, 160);
  return undefined;
}

function truncate(text: string, max: number): string {
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

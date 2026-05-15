// tmi-platform/apps/api/src/modules/editorial/editorial.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EditorialService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateUniqueSlug(baseText: string): Promise<string> {
    const input = baseText.toLowerCase().trim();
    let normalized = '';
    let previousWasDash = false;

    for (const char of input) {
      const isAlphaNumeric =
        (char >= 'a' && char <= 'z') ||
        (char >= '0' && char <= '9');

      if (isAlphaNumeric) {
        normalized += char;
        previousWasDash = false;
        continue;
      }

      if (!previousWasDash && normalized.length > 0) {
        normalized += '-';
        previousWasDash = true;
      }
    }

    const base = normalized.endsWith('-')
      ? normalized.slice(0, -1).slice(0, 80)
      : normalized.slice(0, 80);

    const safeBase = base || 'article';

    let slug = safeBase;
    let counter = 1;

    while (await this.prisma.article.findUnique({ where: { slug } })) {
      counter += 1;
      slug = `${safeBase}-${counter}`;
    }

    return slug;
  }

  /**
   * Takes a snapshot of a contest round's results.
   * This involves counting votes for each entry in the round.
   * @param roundId - The ID of the ContestRound to snapshot.
   */
  async createPollSnapshot(roundId: string) {
    const round = await this.prisma.contestRound.findUnique({
      where: { id: roundId },
      include: {
        entries: {
          select: {
            id: true,
            stageName: true,
          },
        },
      },
    });

    if (!round) {
      throw new NotFoundException(`Contest round with ID ${roundId} not found.`);
    }

    const voteCounts = await this.prisma.contestVote.groupBy({
      by: ['entryId'],
      where: { roundId: roundId },
      _count: {
        entryId: true,
      },
    });

    // Map vote counts to entry data for a more descriptive result
    const results = round.entries.map(entry => {
      const voteCount = voteCounts.find(vc => vc.entryId === entry.id)?._count.entryId || 0;
      return {
        entryId: entry.id,
        stageName: entry.stageName,
        voteCount,
      };
    }).sort((a, b) => b.voteCount - a.voteCount); // Sort descending by vote count

    const winnerInfo = results.length > 0 ? results[0] : null;

    // Use upsert to create a new snapshot or update an existing one for this round
    const snapshot = await this.prisma.pollSnapshot.upsert({
      where: { contestRoundId: roundId },
      create: {
        contestRoundId: roundId,
        results,
        winnerInfo,
      },
      update: {
        results,
        winnerInfo,
      },
    });

    return snapshot;
  }

  /**
   * Generates a draft article from a poll snapshot.
   * @param snapshotId - The ID of the PollSnapshot to use.
   */
  async generateArticleFromSnapshot(snapshotId: string) {
    const snapshot = await this.prisma.pollSnapshot.findUnique({
      where: { id: snapshotId },
      include: {
        contestRound: true,
      },
    });

    if (!snapshot) {
      throw new NotFoundException(`Poll snapshot with ID ${snapshotId} not found.`);
    }

    // This is a simplified article generator. A real implementation would be more complex.
    const results = snapshot.results as { stageName: string, voteCount: number }[];
    const winner = snapshot.winnerInfo as { stageName: string } | null;

    const title = `Results Are In for ${snapshot.contestRound.name}!`;
    const subtitle = winner ? `${winner.stageName} Takes the Top Spot!` : 'See the final results below.';
    
    // Generate content in a structured JSON format (e.g., for TipTap or similar editors)
    const content = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Final Standings' }] },
        {
          type: 'orderedList',
          attrs: { start: 1 },
          content: results.map(r => ({
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: `${r.stageName} (${r.voteCount} votes)` }] }],
          })),
        },
        { type: 'paragraph', content: [{ type: 'text', text: `Congratulations to all participants in ${snapshot.contestRound.name}!` }] },
      ],
    };

    const slug = await this.generateUniqueSlug(title);

    const article = await this.prisma.article.create({
      data: {
        title,
        slug,
        subtitle,
        content,
        status: 'DRAFT',
        pollSnapshot: {
          connect: { id: snapshotId },
        },
      },
    });

    return article;
  }

  /**
   * Finds a single published article by its ID.
   * @param articleId - The ID of the article to find.
   */
  async getArticleById(articleId: string) {
    const article = await this.prisma.article.findFirst({
      where: {
        id: articleId,
        status: 'PUBLISHED',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        pollSnapshot: {
          include: {
            contestRound: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(`Published article with ID ${articleId} not found.`);
    }

    return article;
  }

  /**
   * Idempotent: ensures an artist has a published profile article.
   * Creates one if it doesn't exist; returns the existing one if it does.
   * Safe to call on every onboarding save — will never create duplicates.
   */
  async ensureArtistProfileArticle(
    artistId: string,
    artistName: string,
    artistBio: string,
    authorUserId: string,
  ): Promise<{ id: string; slug: string }> {
    // Idempotence check: return existing article if already linked
    const existing = await this.prisma.artist.findUnique({
      where: { id: artistId },
      select: {
        profileArticle: { select: { id: true, slug: true } },
      },
    });
    if (existing?.profileArticle) {
      return { id: existing.profileArticle.id, slug: existing.profileArticle.slug };
    }

    const slug = await this.generateUniqueSlug(artistName);

    const content = {
      type: 'doc',
      content: artistBio
        ? [{ type: 'paragraph', content: [{ type: 'text', text: artistBio }] }]
        : [],
    };

    const result = await this.prisma.$transaction(async (tx) => {
      const article = await tx.article.create({
        data: {
          title: artistName,
          slug,
          subtitle: 'Artist Profile',
          content,
          status: 'PUBLISHED',
          publishedAt: new Date(),
          authorId: authorUserId,
        },
        select: { id: true, slug: true },
      });
      await tx.artist.update({
        where: { id: artistId },
        data: { profileArticleId: article.id },
      });
      return article;
    });

    return result;
  }

  async getPublishedArticleBySlug(slug: string) {
    const article = await this.prisma.article.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        pollSnapshot: {
          include: {
            contestRound: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(`Published article with slug ${slug} not found.`);
    }

    return article;
  }

  async getLatestArticles(limit = 10) {
    const articles = await this.prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        content: true,
        createdAt: true,
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return articles.map((article) => {
      const content = article.content as Record<string, unknown> | null;
      const contentCoverImage = content && typeof content === 'object'
        ? (content.coverImage ?? content.thumbnail ?? null)
        : null;

      return {
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.subtitle ?? null,
        coverImage: typeof contentCoverImage === 'string' ? contentCoverImage : null,
        createdAt: article.createdAt,
        author: article.author,
      };
    });
  }
}

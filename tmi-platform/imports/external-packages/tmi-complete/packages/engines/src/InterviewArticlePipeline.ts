/**
 * InterviewArticlePipeline.ts
 * Purpose: Interview bots → capture → moderation → publish → magazine article insertion.
 * Placement: packages/engines/src/InterviewArticlePipeline.ts
 *            Import via @tmi/engines/InterviewArticlePipeline
 * Depends on: Nothing (pure functions + types)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type BotRole =
  | 'INTERVIEW_BOT'        // structured Q&A interviews
  | 'REPORTER_BOT'         // writes articles from data
  | 'MODERATION_BOT'       // content safety review
  | 'FACT_CHECK_BOT';      // verifies claims

export type InterviewStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'AWAITING_MODERATION'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type ArticleType =
  | 'ARTIST_FEATURE'          // full artist profile article
  | 'EVENT_RECAP'             // post-event recap
  | 'BATTLE_RESULTS'          // battle night results
  | 'INTERVIEW_TRANSCRIPT'    // formatted interview
  | 'NEWS_UPDATE'             // platform news
  | 'SPONSOR_SPOTLIGHT'       // sponsored content (clearly labeled)
  | 'GENRE_DEEP_DIVE';        // genre/scene explainer

export interface InterviewQuestion {
  id: string;
  text: string;
  category: 'BACKGROUND' | 'CRAFT' | 'EVENTS' | 'GOALS' | 'COMMUNITY' | 'SPONSOR_INTEGRATION';
  followUpTrigger?: string;   // keyword that triggers a follow-up
  isRequired: boolean;
}

export interface InterviewAnswer {
  questionId: string;
  answer: string;
  wordCount: number;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  flagged: boolean;
  flagReason?: string;
}

export interface Interview {
  id: string;
  subjectId: string;          // artist/group ID
  subjectName: string;
  subjectType: 'SOLO_ARTIST' | 'BAND' | 'DANCE_CREW' | 'COMEDIAN' | 'PRODUCER';
  botId: string;
  status: InterviewStatus;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  moderationNotes?: string;
  moderatedBy?: string;       // user ID or bot ID
  publishedArticleId?: string;
  magazineIssue?: string;
}

export interface Article {
  id: string;
  type: ArticleType;
  title: string;
  slug: string;
  subjectId?: string;
  authorId: string;           // user ID or bot ID
  isAiAuthored: boolean;
  content: ArticleSection[];
  coverImageUrl?: string;
  tags: string[];
  genres: string[];
  publishedAt?: Date;
  scheduledPublishAt?: Date;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'UNPUBLISHED';
  magazinePage?: number;      // page number in current issue
  magazineIssue?: string;
  viewCount: number;
  rankingNumber?: number;     // artist ranking feature number
  isSponsoredContent: boolean;
  sponsorId?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface ArticleSection {
  type: 'HEADING' | 'PARAGRAPH' | 'QUOTE' | 'IMAGE' | 'VIDEO' | 'STAT_CARD' | 'SPONSOR_CARD' | 'MEMBER_TILE' | 'PAGE_TEASER';
  content: string;
  metadata?: Record<string, unknown>;
}

// ─── Interview Question Banks ─────────────────────────────────────────────────

export const INTERVIEW_QUESTION_BANKS: Record<string, InterviewQuestion[]> = {
  SOLO_ARTIST: [
    { id: 'bg1', text: 'Tell us about your musical journey. Where did it all begin?', category: 'BACKGROUND', isRequired: true },
    { id: 'bg2', text: 'Which artists inspired you growing up?', category: 'BACKGROUND', isRequired: true },
    { id: 'cr1', text: 'Walk us through your creative process when making a new track.', category: 'CRAFT', isRequired: true },
    { id: 'cr2', text: 'What makes your style unique in today\'s music landscape?', category: 'CRAFT', isRequired: false },
    { id: 'ev1', text: 'Tell us about your experience performing at our live events.', category: 'EVENTS', isRequired: false, followUpTrigger: 'battle' },
    { id: 'ev2', text: 'What was your most memorable moment on the Cypher stage?', category: 'EVENTS', isRequired: false },
    { id: 'go1', text: 'Where do you see yourself in the music industry 3 years from now?', category: 'GOALS', isRequired: true },
    { id: 'co1', text: 'What message do you have for fans and supporters?', category: 'COMMUNITY', isRequired: true },
  ],
  BAND: [
    { id: 'bg1', text: 'How did the band come together and what\'s the origin of your name?', category: 'BACKGROUND', isRequired: true },
    { id: 'cr1', text: 'How does the songwriting process work in your group?', category: 'CRAFT', isRequired: true },
    { id: 'ev1', text: 'Describe the energy of performing as a unit at our Battle of the Bands.', category: 'EVENTS', isRequired: true },
    { id: 'go1', text: 'What\'s the band\'s next big milestone?', category: 'GOALS', isRequired: true },
  ],
  DANCE_CREW: [
    { id: 'bg1', text: 'How did the crew form and what\'s your crew\'s story?', category: 'BACKGROUND', isRequired: true },
    { id: 'cr1', text: 'What dance styles define your crew\'s signature?', category: 'CRAFT', isRequired: true },
    { id: 'ev1', text: 'Tell us about your World Dance Championship journey.', category: 'EVENTS', isRequired: true },
    { id: 'co1', text: 'What do you want to pass on to the next generation of dancers?', category: 'COMMUNITY', isRequired: true },
  ],
};

// ─── Moderation Rules ─────────────────────────────────────────────────────────

export const MODERATION_KEYWORDS = {
  BLOCK: ['explicit', 'hate', 'slur', 'violent threat'],    // hard block
  FLAG: ['controversy', 'political', 'lawsuit', 'drama'],   // flag for human review
};

// ─── Pure Functions ───────────────────────────────────────────────────────────

/** Select questions for an interview based on subject type */
export function selectQuestions(
  subjectType: Interview['subjectType'],
  maxQuestions: number = 8,
): InterviewQuestion[] {
  const bank = INTERVIEW_QUESTION_BANKS[subjectType] ?? INTERVIEW_QUESTION_BANKS.SOLO_ARTIST;
  const required = bank.filter(q => q.isRequired);
  const optional = bank.filter(q => !q.isRequired);
  const fill = optional.slice(0, Math.max(0, maxQuestions - required.length));
  return [...required, ...fill].slice(0, maxQuestions);
}

/** Moderate an answer — returns flagged status */
export function moderateAnswer(answer: string): {
  flagged: boolean;
  blocked: boolean;
  reason?: string;
} {
  const lower = answer.toLowerCase();

  for (const keyword of MODERATION_KEYWORDS.BLOCK) {
    if (lower.includes(keyword)) {
      return { flagged: true, blocked: true, reason: `Blocked keyword: ${keyword}` };
    }
  }

  for (const keyword of MODERATION_KEYWORDS.FLAG) {
    if (lower.includes(keyword)) {
      return { flagged: true, blocked: false, reason: `Flagged keyword: ${keyword}` };
    }
  }

  return { flagged: false, blocked: false };
}

/** Convert completed interview to article sections */
export function interviewToArticle(
  interview: Interview,
  rankingNumber?: number,
): Article {
  const sections: ArticleSection[] = [
    {
      type: 'HEADING',
      content: `A Conversation with ${interview.subjectName}`,
      metadata: { level: 1 },
    },
    ...interview.answers
      .filter(a => !a.flagged || a.sentiment !== 'NEGATIVE')
      .flatMap(a => {
        const question = interview.questions.find(q => q.id === a.questionId);
        return [
          { type: 'QUOTE' as const, content: question?.text ?? '', metadata: { speaker: 'TMI' } },
          { type: 'PARAGRAPH' as const, content: a.answer },
        ];
      }),
  ];

  return {
    id: crypto.randomUUID(),
    type: 'INTERVIEW_TRANSCRIPT',
    title: `${interview.subjectName}: In Their Own Words`,
    slug: interview.subjectName.toLowerCase().replace(/\s+/g, '-') + '-interview',
    subjectId: interview.subjectId,
    authorId: interview.botId,
    isAiAuthored: true,
    content: sections,
    tags: ['interview', interview.subjectType.toLowerCase().replace('_', '-')],
    genres: [],
    status: 'REVIEW',
    viewCount: 0,
    rankingNumber,
    isSponsoredContent: false,
  };
}

/** Calculate magazine page insertion position for an article */
export function calculateInsertionPage(
  issuePages: number,
  articleIndex: number,
  totalArticles: number,
): number {
  return Math.floor((articleIndex / totalArticles) * issuePages) + 1;
}

/** Build the complete magazine page sequence with sponsor/article insertions */
export function buildMagazineSequence(
  articles: Article[],
  sponsorCardPages: number[],  // from SponsorEngine.calculateMagazineInsertions
  miniFactPages: number[],
  memberTilePages: number[],
): Map<number, { type: 'ARTICLE' | 'SPONSOR' | 'FACT' | 'MEMBER_TILE'; id: string }> {
  const sequence = new Map<number, { type: 'ARTICLE' | 'SPONSOR' | 'FACT' | 'MEMBER_TILE'; id: string }>();

  let pageNum = 1;
  articles.forEach(article => {
    while (sponsorCardPages.includes(pageNum) || miniFactPages.includes(pageNum) || memberTilePages.includes(pageNum)) {
      if (sponsorCardPages.includes(pageNum)) sequence.set(pageNum, { type: 'SPONSOR', id: `sponsor_${pageNum}` });
      else if (miniFactPages.includes(pageNum)) sequence.set(pageNum, { type: 'FACT', id: `fact_${pageNum}` });
      else sequence.set(pageNum, { type: 'MEMBER_TILE', id: `member_${pageNum}` });
      pageNum++;
    }
    sequence.set(pageNum, { type: 'ARTICLE', id: article.id });
    pageNum++;
  });

  return sequence;
}

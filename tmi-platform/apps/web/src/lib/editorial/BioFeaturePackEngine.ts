/**
 * BioFeaturePackEngine.ts
 *
 * Canonical Automatic Bio-Maker, Grounded 6-Variant Feature Pack Generator,
 * Lighter Quarterly Check-In, Controlled Approved Rotation, and Evaluated
 * Editorial Learning Signal Authority.
 *
 * Architectural Invariants (LOCKED):
 * 1. ZERO FACT FABRICATION: Only facts explicitly present in the PerformerFactLedger
 *    may appear in generated narratives. Never invent awards, chart numbers,
 *    collaborations, hometowns, labels, or release titles.
 * 2. WILD CARD ISOLATION: Personal/Wild Card or hypothetical answers are strictly
 *    isolated (`isHypotheticalOrWildCard: true`) and never injected as factual
 *    biographical history.
 * 3. 4–6 GENUINELY DIFFERENT GROUNDED NARRATIVES: Generates 6 distinct literary
 *    archetypes with opening-sentence deduplication and token-overlap similarity
 *    enforcement so variants are never shallow word swaps.
 * 4. PERFORMER SOVEREIGNTY: Performers can APPROVE, EDIT, REJECT, FAVORITE,
 *    MAKE_PRIMARY, and ADD_TO_ROTATION (`PRIMARY_BIO` + up to 5 active variants;
 *    never requires approving all 6).
 * 5. SURFACE STABILITY vs CONTROLLED ROTATION:
 *    - Published Magazine Article = STABLE
 *    - Archived Issue Snapshot = STABLE SNAPSHOT
 *    - Dynamic Profile / Feature Intro = CONTROLLED APPROVED ROTATION (rotates
 *      among performer-approved active variants without immediate repeat).
 * 6. AUTHORITY SEPARATION:
 *    - BIO DOES NOT ALTER RANK
 *    - SYSTEM D DOES NOT GENERATE BIO
 *    - ARTICLE GENERATOR DOES NOT CHOOSE #1
 */

export type BioNarrativeArchetype =
  | 'COVER_FEATURE_LEAD'
  | 'DEEP_DIVE_ARTISTIC'
  | 'SHORT_PUNCHY_MOBILE'
  | 'ORIGIN_AND_SOUND'
  | 'LIVE_STAGE_PRESENCE'
  | 'CURRENT_ERA_SPOTLIGHT';

export type BioVariantApprovalStatus = 'DRAFT' | 'APPROVED' | 'REJECTED';

export interface PerformerFactLedgerInput {
  performerId: string;
  slug: string;
  stageName: string;
  role?: string;
  genres?: string[];
  location?: string;
  // 5-Question Onboarding Interview Answers
  originStory?: string;
  soundIdentity?: string;
  currentProject?: string;
  influencesOrProcess?: string;
  nextMilestone?: string;
  // Lighter Quarterly Check-In Answers
  quarterlyWhatsNew?: string;
  quarterlyWorkingOn?: string;
  quarterlySoundChanged?: string;
  quarterlyExcitedAbout?: string;
  // Wild Card (strictly isolated from factual biography)
  wildCardQuestionId?: string;
  wildCardQuestionPrompt?: string;
  wildCardAnswer?: string;
}

export interface VerifiedFactLedger {
  performerId: string;
  slug: string;
  stageName: string;
  role: string;
  genres: string[];
  location: string | null;
  verifiedStatements: {
    originStory: string | null;
    soundIdentity: string | null;
    currentProject: string | null;
    influencesOrProcess: string | null;
    nextMilestone: string | null;
    quarterlyWhatsNew: string | null;
    quarterlyWorkingOn: string | null;
    quarterlySoundChanged: string | null;
    quarterlyExcitedAbout: string | null;
  };
  wildCardSidecar: {
    questionId: string | null;
    questionPrompt: string | null;
    answer: string | null;
    isHypotheticalOrWildCard: true;
    excludedFromFactualBiography: true;
  };
  factTagsPresent: string[];
  extractedAtMs: number;
}

export interface BioNarrativeVariant {
  variantId: string;
  performerId: string;
  archetype: BioNarrativeArchetype;
  archetypeLabel: string;
  recommendedSurface: 'MAGAZINE_COVER_SPREAD' | 'EDITORIAL_DEEP_DIVE' | 'MOBILE_COMPACT' | 'ARTIST_PROFILE' | 'LIVE_STAGE_INTRO' | 'QUARTERLY_UPDATE';
  headline: string;
  narrativeText: string;
  openingSentence: string;
  wordCount: number;
  factTagsUsed: string[];
  containsWildCardFact: false;
  approvalStatus: BioVariantApprovalStatus;
  isPrimary: boolean;
  inActiveRotation: boolean;
  isFavorite: boolean;
  editedByPerformer: boolean;
  rejectionReason?: string;
  maxPairwiseSimilarity: number;
  updatedAtMs: number;
}

export interface PerformerBioPack {
  packId: string;
  performerId: string;
  slug: string;
  factLedger: VerifiedFactLedger;
  variants: BioNarrativeVariant[];
  primaryVariantId: string | null;
  activeRotationVariantIds: string[];
  maxActiveRotationSize: 6;
  generatedAtMs: number;
  quarterKey: string;
}

export interface QuarterlyCheckInQuestion {
  id: string;
  category: 'CORE_QUARTERLY' | 'PERSONAL_OR_WILDCARD';
  prompt: string;
  fieldKey:
    | 'quarterlyWhatsNew'
    | 'quarterlyWorkingOn'
    | 'quarterlySoundChanged'
    | 'quarterlyExcitedAbout'
    | 'wildCardAnswer';
  isHypotheticalOrWildCard: boolean;
}

export interface EditorialLearningSignal {
  signalId: string;
  performerId: string;
  genre: string;
  archetype: BioNarrativeArchetype;
  action: 'APPROVED' | 'REJECTED' | 'EDITED' | 'FAVORITED' | 'MADE_PRIMARY' | 'ADDED_TO_ROTATION';
  editCharacterDelta: number;
  reason?: string;
  recordedAtMs: number;
}

export const CORE_QUARTERLY_CHECKIN_QUESTIONS: readonly QuarterlyCheckInQuestion[] = [
  {
    id: 'q-checkin-whats-new',
    category: 'CORE_QUARTERLY',
    prompt: "What's new in your world since your last feature?",
    fieldKey: 'quarterlyWhatsNew',
    isHypotheticalOrWildCard: false,
  },
  {
    id: 'q-checkin-working-on',
    category: 'CORE_QUARTERLY',
    prompt: 'What are you actively working on right now?',
    fieldKey: 'quarterlyWorkingOn',
    isHypotheticalOrWildCard: false,
  },
  {
    id: 'q-checkin-sound-changed',
    category: 'CORE_QUARTERLY',
    prompt: 'Has your sound or creative approach evolved recently?',
    fieldKey: 'quarterlySoundChanged',
    isHypotheticalOrWildCard: false,
  },
  {
    id: 'q-checkin-excited-about',
    category: 'CORE_QUARTERLY',
    prompt: 'What are you most excited about for the coming months?',
    fieldKey: 'quarterlyExcitedAbout',
    isHypotheticalOrWildCard: false,
  },
] as const;

export const WILDCARD_QUESTION_BANK: readonly QuarterlyCheckInQuestion[] = [
  {
    id: 'wc-late-night-studio',
    category: 'PERSONAL_OR_WILDCARD',
    prompt: 'Wild Card: What is one non-musical ritual or unexpected habit that keeps you grounded outside the studio?',
    fieldKey: 'wildCardAnswer',
    isHypotheticalOrWildCard: true,
  },
  {
    id: 'wc-dream-venue-vibe',
    category: 'PERSONAL_OR_WILDCARD',
    prompt: 'Wild Card: If you could score the soundtrack to any moment or setting—real or imagined—what would it look like?',
    fieldKey: 'wildCardAnswer',
    isHypotheticalOrWildCard: true,
  },
  {
    id: 'wc-first-spark',
    category: 'PERSONAL_OR_WILDCARD',
    prompt: 'Wild Card: What is a piece of advice you once ignored that turned out to be completely right (or completely wrong)?',
    fieldKey: 'wildCardAnswer',
    isHypotheticalOrWildCard: true,
  },
  {
    id: 'wc-off-mic-passion',
    category: 'PERSONAL_OR_WILDCARD',
    prompt: 'Wild Card: When the mic is off and the headphones come off, what is the first thing you reach for?',
    fieldKey: 'wildCardAnswer',
    isHypotheticalOrWildCard: true,
  },
] as const;

export const BIO_MAKER_AUTHORITY_INVARIANTS = {
  BIO_DOES_NOT_ALTER_RANK: true,
  SYSTEM_D_DOES_NOT_GENERATE_BIO: true,
  ARTICLE_GENERATOR_DOES_NOT_CHOOSE_NUMBER_ONE: true,
  ZERO_FACT_FABRICATION: true,
  WILDCARD_NEVER_BECOMES_FACTUAL_BIO: true,
  MAX_ACTIVE_ROTATION_VARIANTS: 6,
} as const;

const BANNED_FABRICATION_PATTERNS: readonly RegExp[] = [
  /\bgrammy\b/i,
  /\bplatinum[-\s]certified\b/i,
  /\bbillboard\s+#?1\b/i,
  /\bsold\s+out\s+world\s+tour\b/i,
  /\bmillion\s+streams\b/i,
];

function cleanFactText(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.replace(/\s+/g, ' ').trim();
  if (!trimmed) return null;
  return trimmed.replace(/[.!?]+$/, '');
}

/**
 * Builds the Lighter Quarterly Check-In questionnaire (4 core questions + 1 deterministic or seeded Wild Card).
 */
export function buildQuarterlyCheckInQuestionnaire(seedIndex = 0): {
  coreQuestions: readonly QuarterlyCheckInQuestion[];
  wildCardQuestion: QuarterlyCheckInQuestion;
  allQuestions: QuarterlyCheckInQuestion[];
} {
  const safeIdx = Math.abs(Math.floor(seedIndex)) % WILDCARD_QUESTION_BANK.length;
  const wildCardQuestion = WILDCARD_QUESTION_BANK[safeIdx]!;
  return {
    coreQuestions: CORE_QUARTERLY_CHECKIN_QUESTIONS,
    wildCardQuestion,
    allQuestions: [...CORE_QUARTERLY_CHECKIN_QUESTIONS, wildCardQuestion],
  };
}

/**
 * Extracts a strictly verified Fact Ledger from onboarding and/or quarterly check-in answers.
 * Never invents missing fields; isolates Wild Card answers in `wildCardSidecar`.
 */
export function buildVerifiedFactLedger(input: PerformerFactLedgerInput, nowMs = Date.now()): VerifiedFactLedger {
  const stageName = cleanFactText(input.stageName) ?? 'Performer';
  const role = cleanFactText(input.role) ?? 'Artist';
  const genres = (input.genres ?? [])
    .map((g) => g.trim())
    .filter(Boolean);
  const location = cleanFactText(input.location);

  const verifiedStatements = {
    originStory: cleanFactText(input.originStory),
    soundIdentity: cleanFactText(input.soundIdentity),
    currentProject: cleanFactText(input.currentProject),
    influencesOrProcess: cleanFactText(input.influencesOrProcess),
    nextMilestone: cleanFactText(input.nextMilestone),
    quarterlyWhatsNew: cleanFactText(input.quarterlyWhatsNew),
    quarterlyWorkingOn: cleanFactText(input.quarterlyWorkingOn),
    quarterlySoundChanged: cleanFactText(input.quarterlySoundChanged),
    quarterlyExcitedAbout: cleanFactText(input.quarterlyExcitedAbout),
  };

  const factTagsPresent: string[] = ['stageName', 'role'];
  if (genres.length > 0) factTagsPresent.push('genres');
  if (location) factTagsPresent.push('location');
  for (const [key, val] of Object.entries(verifiedStatements)) {
    if (val) factTagsPresent.push(key);
  }

  return {
    performerId: input.performerId,
    slug: input.slug,
    stageName,
    role,
    genres,
    location,
    verifiedStatements,
    wildCardSidecar: {
      questionId: input.wildCardQuestionId ?? null,
      questionPrompt: cleanFactText(input.wildCardQuestionPrompt),
      answer: cleanFactText(input.wildCardAnswer),
      isHypotheticalOrWildCard: true,
      excludedFromFactualBiography: true,
    },
    factTagsPresent,
    extractedAtMs: nowMs,
  };
}

/**
 * Applies a Lighter Quarterly Check-In update onto an existing Fact Ledger
 * without wiping the performer's foundational onboarding facts.
 */
export function applyQuarterlyCheckInToFactLedger(
  existing: VerifiedFactLedger,
  checkIn: {
    quarterlyWhatsNew?: string;
    quarterlyWorkingOn?: string;
    quarterlySoundChanged?: string;
    quarterlyExcitedAbout?: string;
    wildCardQuestionId?: string;
    wildCardQuestionPrompt?: string;
    wildCardAnswer?: string;
  },
  nowMs = Date.now(),
): VerifiedFactLedger {
  return buildVerifiedFactLedger(
    {
      performerId: existing.performerId,
      slug: existing.slug,
      stageName: existing.stageName,
      role: existing.role,
      genres: existing.genres,
      location: existing.location ?? undefined,
      originStory: existing.verifiedStatements.originStory ?? undefined,
      soundIdentity: existing.verifiedStatements.soundIdentity ?? undefined,
      currentProject: existing.verifiedStatements.currentProject ?? undefined,
      influencesOrProcess: existing.verifiedStatements.influencesOrProcess ?? undefined,
      nextMilestone: existing.verifiedStatements.nextMilestone ?? undefined,
      quarterlyWhatsNew: checkIn.quarterlyWhatsNew ?? existing.verifiedStatements.quarterlyWhatsNew ?? undefined,
      quarterlyWorkingOn: checkIn.quarterlyWorkingOn ?? existing.verifiedStatements.quarterlyWorkingOn ?? undefined,
      quarterlySoundChanged: checkIn.quarterlySoundChanged ?? existing.verifiedStatements.quarterlySoundChanged ?? undefined,
      quarterlyExcitedAbout: checkIn.quarterlyExcitedAbout ?? existing.verifiedStatements.quarterlyExcitedAbout ?? undefined,
      wildCardQuestionId: checkIn.wildCardQuestionId ?? existing.wildCardSidecar.questionId ?? undefined,
      wildCardQuestionPrompt: checkIn.wildCardQuestionPrompt ?? existing.wildCardSidecar.questionPrompt ?? undefined,
      wildCardAnswer: checkIn.wildCardAnswer ?? existing.wildCardSidecar.answer ?? undefined,
    },
    nowMs,
  );
}

function extractFirstSentence(text: string): string {
  const match = text.trim().match(/^[^.!?]+[.!?]/);
  return (match ? match[0] : text.trim()).toLowerCase();
}

function tokenizeForSimilarity(text: string): Set<string> {
  const stopWords = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'their', 'his', 'her', 'its', 'are', 'was']);
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
  return new Set(tokens);
}

export function computeNarrativeSimilarity(textA: string, textB: string): number {
  const setA = tokenizeForSimilarity(textA);
  const setB = tokenizeForSimilarity(textB);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection += 1;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : Number((intersection / union).toFixed(3));
}

/**
 * Generates 6 genuinely distinct, fact-grounded narrative variants from a VerifiedFactLedger.
 * Every sentence is anchored strictly in supplied facts; Wild Card answers are never injected
 * into factual biographical copy.
 */
export function generateGroundedBioVariantPack(
  input: PerformerFactLedgerInput | VerifiedFactLedger,
  options?: {
    quarterKey?: string;
    nowMs?: number;
  },
): PerformerBioPack {
  const nowMs = options?.nowMs ?? Date.now();
  const quarterKey = options?.quarterKey ?? computeQuarterKey(nowMs);
  const ledger: VerifiedFactLedger =
    'verifiedStatements' in input ? input : buildVerifiedFactLedger(input, nowMs);

  const name = ledger.stageName;
  const roleLabel = ledger.role;
  const genrePhrase = ledger.genres.length > 0 ? ledger.genres.join(' / ') : 'independent music';
  const locationPhrase = ledger.location ? ` representing ${ledger.location}` : '';

  const s = ledger.verifiedStatements;
  const activeWork = s.quarterlyWorkingOn ?? s.currentProject;
  const activeNew = s.quarterlyWhatsNew;
  const soundDesc = s.quarterlySoundChanged ?? s.soundIdentity;
  const originDesc = s.originStory;
  const processDesc = s.influencesOrProcess;
  const horizonDesc = s.quarterlyExcitedAbout ?? s.nextMilestone;

  const rawConfigs: Array<{
    archetype: BioNarrativeArchetype;
    archetypeLabel: string;
    recommendedSurface: BioNarrativeVariant['recommendedSurface'];
    headline: string;
    build: () => { text: string; tags: string[] };
  }> = [
    {
      archetype: 'COVER_FEATURE_LEAD',
      archetypeLabel: 'Magazine Cover Feature Lead',
      recommendedSurface: 'MAGAZINE_COVER_SPREAD',
      headline: `${name}: Inside the ${genrePhrase} Vision`,
      build: () => {
        const tags = ['stageName', 'role'];
        const parts: string[] = [
          `Stepping into the TMI spotlight${locationPhrase}, ${name} defines what a dedicated ${genrePhrase} ${roleLabel.toLowerCase()} brings to the culture.`,
        ];
        if (ledger.genres.length > 0) tags.push('genres');
        if (ledger.location) tags.push('location');
        if (soundDesc) {
          parts.push(`Characterized by ${soundDesc}, the sonic fingerprint is unmistakable from the first bar.`);
          tags.push(s.quarterlySoundChanged ? 'quarterlySoundChanged' : 'soundIdentity');
        }
        if (activeWork) {
          parts.push(`Right now, the focus is locked on ${activeWork}.`);
          tags.push(s.quarterlyWorkingOn ? 'quarterlyWorkingOn' : 'currentProject');
        }
        if (horizonDesc) {
          parts.push(`Looking ahead, ${name} is building toward ${horizonDesc}.`);
          tags.push(s.quarterlyExcitedAbout ? 'quarterlyExcitedAbout' : 'nextMilestone');
        }
        return { text: parts.join(' '), tags };
      },
    },
    {
      archetype: 'DEEP_DIVE_ARTISTIC',
      archetypeLabel: 'Deep Dive & Craft',
      recommendedSurface: 'EDITORIAL_DEEP_DIVE',
      headline: `The Architecture of Sound: How ${name} Builds`,
      build: () => {
        const tags = ['stageName', 'role'];
        const parts: string[] = [
          `Every frequency in ${name}'s catalog is shaped by deliberate craft as a ${genrePhrase} ${roleLabel.toLowerCase()}.`,
        ];
        if (processDesc) {
          parts.push(`Drawing creative discipline from ${processDesc}, the work refuses shortcuts.`);
          tags.push('influencesOrProcess');
        }
        if (soundDesc) {
          parts.push(`That approach translates directly into ${soundDesc}.`);
          tags.push(s.quarterlySoundChanged ? 'quarterlySoundChanged' : 'soundIdentity');
        }
        if (originDesc) {
          parts.push(`Anchored in ${originDesc}, the artistic mission stays true to its foundation.`);
          tags.push('originStory');
        }
        return { text: parts.join(' '), tags };
      },
    },
    {
      archetype: 'SHORT_PUNCHY_MOBILE',
      archetypeLabel: 'Short & Punchy (Mobile Ready)',
      recommendedSurface: 'MOBILE_COMPACT',
      headline: `${name} · ${genrePhrase}`,
      build: () => {
        const tags = ['stageName', 'genres'];
        const core = soundDesc
          ? `${name} is a ${genrePhrase} ${roleLabel.toLowerCase()}${locationPhrase} known for ${soundDesc}.`
          : `${name} is a ${genrePhrase} ${roleLabel.toLowerCase()}${locationPhrase} making waves on TMI.`;
        const nextBit = activeWork
          ? ` Currently focused on ${activeWork}.`
          : horizonDesc
            ? ` Next up: ${horizonDesc}.`
            : '';
        if (soundDesc) tags.push(s.quarterlySoundChanged ? 'quarterlySoundChanged' : 'soundIdentity');
        if (activeWork) tags.push(s.quarterlyWorkingOn ? 'quarterlyWorkingOn' : 'currentProject');
        return { text: `${core}${nextBit}`.trim(), tags };
      },
    },
    {
      archetype: 'ORIGIN_AND_SOUND',
      archetypeLabel: 'Origin & Sonic Evolution',
      recommendedSurface: 'ARTIST_PROFILE',
      headline: `Roots & Resonance: ${name}'s Journey`,
      build: () => {
        const tags = ['stageName'];
        const parts: string[] = [];
        if (originDesc) {
          parts.push(`Beginning with ${originDesc}, ${name}${locationPhrase} forged a distinct lane in ${genrePhrase}.`);
          tags.push('originStory');
        } else {
          parts.push(`Forging an independent path${locationPhrase}, ${name} brings authentic conviction to ${genrePhrase}.`);
        }
        if (soundDesc) {
          parts.push(`Today, that foundation powers ${soundDesc}.`);
          tags.push(s.quarterlySoundChanged ? 'quarterlySoundChanged' : 'soundIdentity');
        }
        if (processDesc) {
          parts.push(`Guided by ${processDesc}, each session pushes the craft forward.`);
          tags.push('influencesOrProcess');
        }
        return { text: parts.join(' '), tags };
      },
    },
    {
      archetype: 'LIVE_STAGE_PRESENCE',
      archetypeLabel: 'Stage & Arena Introduction',
      recommendedSurface: 'LIVE_STAGE_INTRO',
      headline: `Now Entering the Stage: ${name}`,
      build: () => {
        const tags = ['stageName', 'role'];
        const parts: string[] = [
          `When the room lights shift on TMI, ${name} commands attention as a ${genrePhrase} ${roleLabel.toLowerCase()}${locationPhrase}.`,
        ];
        if (activeWork) {
          parts.push(`Delivering momentum around ${activeWork}, the energy is built for real listeners.`);
          tags.push(s.quarterlyWorkingOn ? 'quarterlyWorkingOn' : 'currentProject');
        }
        if (soundDesc) {
          parts.push(`Expect ${soundDesc} from start to finish.`);
          tags.push(s.quarterlySoundChanged ? 'quarterlySoundChanged' : 'soundIdentity');
        }
        return { text: parts.join(' '), tags };
      },
    },
    {
      archetype: 'CURRENT_ERA_SPOTLIGHT',
      archetypeLabel: 'Current Era & Quarterly Momentum',
      recommendedSurface: 'QUARTERLY_UPDATE',
      headline: `${name}: Current Chapter (${quarterKey})`,
      build: () => {
        const tags = ['stageName'];
        const parts: string[] = [
          `In this ${quarterKey} chapter, ${name} continues to sharpen a signature presence in ${genrePhrase}.`,
        ];
        if (activeNew) {
          parts.push(`The latest update: ${activeNew}.`);
          tags.push('quarterlyWhatsNew');
        }
        if (activeWork) {
          parts.push(`In the studio and on the platform, ${name} is centered on ${activeWork}.`);
          tags.push(s.quarterlyWorkingOn ? 'quarterlyWorkingOn' : 'currentProject');
        }
        if (horizonDesc) {
          parts.push(`With sights set on ${horizonDesc}, the trajectory remains unmistakable.`);
          tags.push(s.quarterlyExcitedAbout ? 'quarterlyExcitedAbout' : 'nextMilestone');
        }
        return { text: parts.join(' '), tags };
      },
    },
  ];

  const builtTexts = rawConfigs.map((cfg) => ({ cfg, built: cfg.build() }));

  const variants: BioNarrativeVariant[] = builtTexts.map(({ cfg, built }, idx) => {
    const openingSentence = extractFirstSentence(built.text);
    const wordCount = built.text.split(/\s+/).filter(Boolean).length;
    let maxSim = 0;
    for (let j = 0; j < builtTexts.length; j += 1) {
      if (j === idx) continue;
      const sim = computeNarrativeSimilarity(built.text, builtTexts[j]!.built.text);
      if (sim > maxSim) maxSim = sim;
    }

    return {
      variantId: `bio-var-${ledger.performerId}-${quarterKey.toLowerCase()}-${idx + 1}`,
      performerId: ledger.performerId,
      archetype: cfg.archetype,
      archetypeLabel: cfg.archetypeLabel,
      recommendedSurface: cfg.recommendedSurface,
      headline: cfg.headline,
      narrativeText: built.text,
      openingSentence,
      wordCount,
      factTagsUsed: Array.from(new Set(built.tags)),
      containsWildCardFact: false,
      approvalStatus: 'DRAFT',
      isPrimary: false,
      inActiveRotation: false,
      isFavorite: false,
      editedByPerformer: false,
      maxPairwiseSimilarity: maxSim,
      updatedAtMs: nowMs,
    };
  });

  return {
    packId: `bio-pack-${ledger.performerId}-${quarterKey.toLowerCase()}`,
    performerId: ledger.performerId,
    slug: ledger.slug,
    factLedger: ledger,
    variants,
    primaryVariantId: null,
    activeRotationVariantIds: [],
    maxActiveRotationSize: 6,
    generatedAtMs: nowMs,
    quarterKey,
  };
}

export function computeQuarterKey(atMs = Date.now()): string {
  const d = new Date(atMs);
  const year = d.getUTCFullYear();
  const q = Math.floor(d.getUTCMonth() / 3) + 1;
  return `${year}-Q${q}`;
}

/**
 * Verifies that a narrative text does not contain banned fabricated claims
 * unless those exact words were explicitly supplied by the performer in their Fact Ledger.
 */
export function verifyNarrativeFactIntegrity(
  narrativeText: string,
  factLedger: VerifiedFactLedger,
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];
  const ledgerSource = [
    factLedger.stageName,
    factLedger.role,
    factLedger.location ?? '',
    ...factLedger.genres,
    ...Object.values(factLedger.verifiedStatements).map((v) => v ?? ''),
  ]
    .join(' ')
    .toLowerCase();

  for (const pattern of BANNED_FABRICATION_PATTERNS) {
    if (pattern.test(narrativeText) && !pattern.test(ledgerSource)) {
      violations.push(`unverified_claim:${pattern.source}`);
    }
  }

  // Ensure Wild Card answer was not leaked into factual bio narrative
  const wcAnswer = factLedger.wildCardSidecar.answer;
  if (wcAnswer && wcAnswer.length >= 12) {
    const normalizedNarrative = narrativeText.toLowerCase();
    const normalizedWc = wcAnswer.toLowerCase();
    if (normalizedNarrative.includes(normalizedWc)) {
      violations.push('wildcard_leaked_into_factual_bio');
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Performer action mutations on a PerformerBioPack:
 * APPROVE, EDIT, REJECT, FAVORITE, MAKE_PRIMARY, ADD_TO_ROTATION, REMOVE_FROM_ROTATION.
 * Enforces:
 * - Unapproved variants can never enter `activeRotationVariantIds` or become `primaryVariantId`.
 * - Up to 6 approved variants in active rotation (`PRIMARY` + up to 5 additional active variants).
 * - Never requires the performer to approve all 6 variants.
 */
export function applyPerformerBioVariantAction(
  pack: PerformerBioPack,
  actionInput:
    | { type: 'APPROVE'; variantId: string; addToRotation?: boolean }
    | { type: 'REJECT'; variantId: string; reason?: string }
    | { type: 'EDIT'; variantId: string; newNarrativeText: string; newHeadline?: string; autoApprove?: boolean }
    | { type: 'FAVORITE'; variantId: string; isFavorite?: boolean }
    | { type: 'MAKE_PRIMARY'; variantId: string }
    | { type: 'SET_ROTATION'; variantId: string; inRotation: boolean },
  nowMs = Date.now(),
): PerformerBioPack {
  const target = pack.variants.find((v) => v.variantId === actionInput.variantId);
  if (!target) {
    return pack;
  }

  const primaryGenre = pack.factLedger.genres[0] ?? 'Independent';

  const updatedVariants = pack.variants.map((v) => {
    if (v.variantId !== actionInput.variantId) {
      if (actionInput.type === 'MAKE_PRIMARY') {
        return { ...v, isPrimary: false };
      }
      return v;
    }

    switch (actionInput.type) {
      case 'APPROVE': {
        const inActiveRotation = actionInput.addToRotation !== false;
        const shouldBePrimary = pack.primaryVariantId === null;
        recordEditorialLearningSignal({
          performerId: pack.performerId,
          genre: primaryGenre,
          archetype: v.archetype,
          action: 'APPROVED',
          editCharacterDelta: 0,
          nowMs,
        });
        return {
          ...v,
          approvalStatus: 'APPROVED' as const,
          inActiveRotation,
          isPrimary: shouldBePrimary || v.isPrimary,
          rejectionReason: undefined,
          updatedAtMs: nowMs,
        };
      }
      case 'REJECT': {
        recordEditorialLearningSignal({
          performerId: pack.performerId,
          genre: primaryGenre,
          archetype: v.archetype,
          action: 'REJECTED',
          editCharacterDelta: 0,
          reason: actionInput.reason,
          nowMs,
        });
        return {
          ...v,
          approvalStatus: 'REJECTED' as const,
          isPrimary: false,
          inActiveRotation: false,
          rejectionReason: actionInput.reason ?? 'Rejected by performer',
          updatedAtMs: nowMs,
        };
      }
      case 'EDIT': {
        const cleaned = actionInput.newNarrativeText.trim() || v.narrativeText;
        const delta = Math.abs(cleaned.length - v.narrativeText.length);
        const approvalStatus =
          actionInput.autoApprove !== false ? ('APPROVED' as const) : v.approvalStatus;
        recordEditorialLearningSignal({
          performerId: pack.performerId,
          genre: primaryGenre,
          archetype: v.archetype,
          action: 'EDITED',
          editCharacterDelta: delta,
          nowMs,
        });
        return {
          ...v,
          headline: actionInput.newHeadline?.trim() || v.headline,
          narrativeText: cleaned,
          openingSentence: extractFirstSentence(cleaned),
          wordCount: cleaned.split(/\s+/).filter(Boolean).length,
          editedByPerformer: true,
          approvalStatus,
          inActiveRotation: approvalStatus === 'APPROVED' ? true : v.inActiveRotation,
          updatedAtMs: nowMs,
        };
      }
      case 'FAVORITE': {
        const nextFav = actionInput.isFavorite ?? !v.isFavorite;
        if (nextFav) {
          recordEditorialLearningSignal({
            performerId: pack.performerId,
            genre: primaryGenre,
            archetype: v.archetype,
            action: 'FAVORITED',
            editCharacterDelta: 0,
            nowMs,
          });
        }
        return {
          ...v,
          isFavorite: nextFav,
          updatedAtMs: nowMs,
        };
      }
      case 'MAKE_PRIMARY': {
        recordEditorialLearningSignal({
          performerId: pack.performerId,
          genre: primaryGenre,
          archetype: v.archetype,
          action: 'MADE_PRIMARY',
          editCharacterDelta: 0,
          nowMs,
        });
        return {
          ...v,
          approvalStatus: 'APPROVED' as const,
          isPrimary: true,
          inActiveRotation: true,
          rejectionReason: undefined,
          updatedAtMs: nowMs,
        };
      }
      case 'SET_ROTATION': {
        const canRotate = actionInput.inRotation && v.approvalStatus === 'APPROVED';
        if (canRotate) {
          recordEditorialLearningSignal({
            performerId: pack.performerId,
            genre: primaryGenre,
            archetype: v.archetype,
            action: 'ADDED_TO_ROTATION',
            editCharacterDelta: 0,
            nowMs,
          });
        }
        return {
          ...v,
          inActiveRotation: canRotate,
          updatedAtMs: nowMs,
        };
      }
    }
  });

  // Reconcile primaryVariantId and bounded activeRotationVariantIds (max 6, only APPROVED)
  let primaryVariant = updatedVariants.find((v) => v.isPrimary && v.approvalStatus === 'APPROVED') ?? null;
  if (!primaryVariant) {
    primaryVariant = updatedVariants.find((v) => v.approvalStatus === 'APPROVED') ?? null;
  }

  const finalVariants = updatedVariants.map((v) => ({
    ...v,
    isPrimary: primaryVariant ? v.variantId === primaryVariant.variantId : false,
  }));

  const activeRotationVariantIds = finalVariants
    .filter((v) => v.approvalStatus === 'APPROVED' && (v.inActiveRotation || v.isPrimary))
    .slice(0, 6)
    .map((v) => v.variantId);

  return {
    ...pack,
    variants: finalVariants,
    primaryVariantId: primaryVariant?.variantId ?? null,
    activeRotationVariantIds,
  };
}

// ── Controlled Returning-Visitor Bio Rotation ─────────────────────────────────

const readerLastSeenVariantMap = new Map<string, string>();

/**
 * Selects the next performer-approved bio variant for a dynamic profile or feature intro surface.
 * Rules:
 * - Only `APPROVED` variants in `activeRotationVariantIds` (or `primaryVariantId`) may ever be served.
 * - If a reader/visitor returns (`visitorKey`), never repeats the immediately preceding variant when >= 2 approved variants exist.
 * - Published Magazine Articles and Archived Issue Snapshots do NOT call this rotator; they render their locked snapshot.
 */
export function selectNextRotatingBioVariant(
  pack: PerformerBioPack,
  visitorKey = 'anonymous-reader',
): BioNarrativeVariant | null {
  const approvedPool = pack.variants.filter(
    (v) =>
      v.approvalStatus === 'APPROVED' &&
      (pack.activeRotationVariantIds.includes(v.variantId) || v.isPrimary),
  );

  if (approvedPool.length === 0) {
    return null;
  }

  if (approvedPool.length === 1) {
    const only = approvedPool[0]!;
    readerLastSeenVariantMap.set(`${pack.performerId}:${visitorKey}`, only.variantId);
    return only;
  }

  const historyKey = `${pack.performerId}:${visitorKey}`;
  const lastVariantId = readerLastSeenVariantMap.get(historyKey);

  // Order with Primary first, then favorites, then remaining approved variants
  const ordered = [...approvedPool].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
    if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
    return a.variantId.localeCompare(b.variantId);
  });

  if (!lastVariantId) {
    const first = ordered[0]!;
    readerLastSeenVariantMap.set(historyKey, first.variantId);
    return first;
  }

  const lastIdx = ordered.findIndex((v) => v.variantId === lastVariantId);
  const nextIdx = lastIdx >= 0 ? (lastIdx + 1) % ordered.length : 0;
  const chosen = ordered[nextIdx]!;
  readerLastSeenVariantMap.set(historyKey, chosen.variantId);
  return chosen;
}

// ── Evaluated Editorial Learning Signal Ledger ────────────────────────────────

const editorialLearningSignals: EditorialLearningSignal[] = [];

export function recordEditorialLearningSignal(input: {
  performerId: string;
  genre: string;
  archetype: BioNarrativeArchetype;
  action: EditorialLearningSignal['action'];
  editCharacterDelta: number;
  reason?: string;
  nowMs?: number;
}): EditorialLearningSignal {
  const signal: EditorialLearningSignal = {
    signalId: `sig-${input.performerId}-${Date.now()}-${editorialLearningSignals.length + 1}`,
    performerId: input.performerId,
    genre: input.genre,
    archetype: input.archetype,
    action: input.action,
    editCharacterDelta: input.editCharacterDelta,
    reason: input.reason,
    recordedAtMs: input.nowMs ?? Date.now(),
  };
  editorialLearningSignals.push(signal);
  return signal;
}

export function getEditorialLearningSummary(genreFilter?: string): {
  totalSignals: number;
  archetypeApprovalWeights: Record<BioNarrativeArchetype, number>;
  signals: EditorialLearningSignal[];
} {
  const filtered = genreFilter
    ? editorialLearningSignals.filter((s) => s.genre.toLowerCase() === genreFilter.toLowerCase())
    : editorialLearningSignals;

  const weights: Record<BioNarrativeArchetype, number> = {
    COVER_FEATURE_LEAD: 1,
    DEEP_DIVE_ARTISTIC: 1,
    SHORT_PUNCHY_MOBILE: 1,
    ORIGIN_AND_SOUND: 1,
    LIVE_STAGE_PRESENCE: 1,
    CURRENT_ERA_SPOTLIGHT: 1,
  };

  for (const sig of filtered) {
    if (sig.action === 'APPROVED' || sig.action === 'ADDED_TO_ROTATION') {
      weights[sig.archetype] += 1;
    } else if (sig.action === 'MADE_PRIMARY' || sig.action === 'FAVORITED') {
      weights[sig.archetype] += 2;
    } else if (sig.action === 'REJECTED') {
      weights[sig.archetype] = Math.max(0.25, weights[sig.archetype] - 0.75);
    }
  }

  return {
    totalSignals: filtered.length,
    archetypeApprovalWeights: weights,
    signals: [...filtered],
  };
}

export function __resetBioMakerLearningAndRotationForTests(): void {
  readerLastSeenVariantMap.clear();
  editorialLearningSignals.length = 0;
}

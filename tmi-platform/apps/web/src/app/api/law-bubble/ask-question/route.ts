/**
 * ==================================================================================
 * LAW BUBBLE - ASK QUESTION (SSE STREAMING)
 * ==================================================================================
 * 
 * "The cheapest lawyer you try first" - $1 per question
 * 
 * Returns structured "Answer Contract":
 * - front: One-sentence plain English answer
 * - key_points: 2-5 bulleted facts
 * - actions: What to do next (checklist)
 * - avoid: Common mistakes
 * - deadlines: Urgent warnings (statute of limitations, etc.)
 * - followups: 2 clarifying questions (if needed)
 * - disclaimer: "Information only, not legal advice"
 * 
 * Performance targets:
 * - Time to first token: < 700ms
 * - P95 full response: 6-12 seconds
 * 
 * ==================================================================================
 */

import { NextRequest } from 'next/server';

// ============================================================================
// CACHING + TOPIC CLASSIFICATION
// ============================================================================

interface CachedAnswer {
  hash: string;
  answer: AnswerContract;
  timestamp: Date;
}

interface AnswerContract {
  front: string;
  key_points: string[];
  actions: string[];
  avoid: string[];
  deadlines: string[];
  followups: string[];
  disclaimer: string;
}

const answerCache = new Map<string, CachedAnswer>();

const TOPICS = {
  TRAFFIC: ['traffic', 'pulled over', 'speeding', 'dui', 'license'],
  TENANT: ['tenant', 'landlord', 'rent', 'lease', 'eviction'],
  EMPLOYMENT: ['fired', 'employer', 'wage', 'discrimination', 'harassment'],
  FAMILY: ['divorce', 'custody', 'child support', 'alimony', 'visitation'],
  CRIMINAL: ['arrest', 'charges', 'court', 'felony', 'misdemeanor'],
  CONTRACT: ['contract', 'breach', 'agreement', 'sue', 'lawsuit'],
  TAX: ['tax', 'irs', 'audit', 'deduction'],
  IMMIGRATION: ['visa', 'green card', 'deportation', 'citizenship'],
  BANKRUPTCY: ['bankruptcy', 'debt', 'creditor', 'foreclosure'],
  PERSONAL_INJURY: ['injury', 'accident', 'medical', 'insurance claim'],
};

function detectTopic(question: string): string {
  const lowerQ = question.toLowerCase();

  for (const [topic, keywords] of Object.entries(TOPICS)) {
    if (keywords.some(kw => lowerQ.includes(kw))) {
      return topic;
    }
  }

  return 'GENERAL';
}

function normalizeQuestion(question: string, jurisdiction?: { country: string; state?: string }): string {
  const normalized = question.toLowerCase().trim().replace(/\s+/g, ' ');
  const jKey = jurisdiction ? `${jurisdiction.country}_${jurisdiction.state || 'general'}` : 'US_general';
  return `${jKey}:${normalized}`;
}

function getCachedAnswer(hash: string): AnswerContract | null {
  const cached = answerCache.get(hash);

  if (cached && (Date.now() - cached.timestamp.getTime()) < 24 * 60 * 60 * 1000) {
    return cached.answer;
  }

  return null;
}

function cacheAnswer(hash: string, answer: AnswerContract): void {
  answerCache.set(hash, { hash, answer, timestamp: new Date() });
}

// ============================================================================
// HIGH-STAKES DETECTION
// ============================================================================

function isHighStakes(question: string, topic: string): boolean {
  const lowerQ = question.toLowerCase();

  const highStakesKeywords = [
    'court', 'deadline', 'trial', 'hearing', 'custody', 'immigration', 'deportation',
    'criminal', 'arrest', 'charges', 'felony', 'prison', 'jail', 'emergency'
  ];

  return highStakesKeywords.some(kw => lowerQ.includes(kw)) || 
         ['CRIMINAL', 'IMMIGRATION', 'FAMILY'].includes(topic);
}

// ============================================================================
// SSE STREAMING HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const { questionId, questionText, userId, jurisdiction } = await request.json();

  if (!questionText || questionText.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'Question required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Detect topic
  const topic = detectTopic(questionText);

  // Check cache
  const questionHash = normalizeQuestion(questionText, jurisdiction);
  const cached = getCachedAnswer(questionHash);

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send metadata immediately
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'metadata',
          topic,
          jurisdiction: jurisdiction || { country: 'US', state: 'unknown' },
          cached: !!cached,
        })}\n\n`));

        if (cached) {
          // Instant cached answer
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'answer',
            answer: cached,
          })}\n\n`));

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          controller.close();
          return;
        }

        // Generate answer (streaming simulation - replace with real AI)
        const answer = await generateAnswer(questionText, topic, jurisdiction);

        // Cache it
        cacheAnswer(questionHash, answer);

        // Stream answer parts
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'answer',
          answer,
        })}\n\n`));

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
        controller.close();

      } catch (error: any) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'error',
          message: error.message,
        })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// ============================================================================
// ANSWER GENERATION (Mock - replace with OpenAI/Claude)
// ============================================================================

async function generateAnswer(
  question: string,
  topic: string,
  jurisdiction?: { country: string; state?: string }
): Promise<AnswerContract> {
  const highStakes = isHighStakes(question, topic);

  // Mock answers by topic
  const mockAnswers: Record<string, AnswerContract> = {
    TRAFFIC: {
      front: 'You have the right to remain silent during a traffic stop beyond providing license and registration.',
      key_points: [
        'You must provide license, registration, and proof of insurance',
        'You can refuse consent to search your vehicle',
        'You can ask "Am I free to go?" to clarify if you\'re being detained',
        'Anything you say can be used against you',
      ],
      actions: [
        'Stay calm and keep hands visible',
        'Politely decline to answer questions beyond ID',
        'If arrested, request a lawyer immediately',
        'Document the stop (time, location, officer badge number)',
      ],
      avoid: [
        'DON\'T consent to a vehicle search',
        'DON\'T answer "How much have you had to drink?"',
        'DON\'T argue or get confrontational',
        'DON\'T flee or resist',
      ],
      deadlines: [
        'Traffic tickets: typically 30 days to respond',
        'Court date is listed on citation - missing it can result in a warrant',
      ],
      followups: [
        'Were you issued a citation or arrested?',
        'What state did this occur in? (Laws vary)',
      ],
      disclaimer: 'Information only • Not legal advice • Consult a licensed attorney for your situation',
    },

    TENANT: {
      front: 'Tenants have rights to habitable living conditions, privacy, and protection from unlawful eviction.',
      key_points: [
        'Landlord must provide safe, working plumbing, heating, and electrical',
        'Landlord must give 24-hour notice before entering (except emergencies)',
        'Cannot be evicted without proper court process (no "self-help" evictions)',
        'Security deposits must be returned within 30-60 days (varies by state)',
      ],
      actions: [
        'Document all issues with photos and written notices to landlord',
        'Send requests for repairs in writing (certified mail)',
        'Review your lease for dispute resolution clauses',
        'Contact local tenant rights organization if threatened with illegal eviction',
      ],
      avoid: [
        'DON\'T withhold rent without following proper legal process',
        'DON\'T make repairs and deduct from rent without written permission',
        'DON\'T ignore eviction notices (respond within deadline)',
      ],
      deadlines: [
        'Eviction response: typically 5-7 days after receiving notice',
        'Security deposit claims: varies by state (30-60 days)',
      ],
      followups: [
        'What state are you renting in?',
        'Do you have a written lease or month-to-month?',
      ],
      disclaimer: 'Information only • Not legal advice • Consult a local tenant lawyer or housing authority',
    },

    EMPLOYMENT: {
      front: 'Employment laws vary by state, but most employees are "at-will" unless you have a contract.',
      key_points: [
        'At-will means you can be fired for any reason (except illegal discrimination)',
        'Protected classes: race, gender, age, disability, religion, national origin',
        'You may be entitled to unemployment benefits if fired without cause',
        'Wage theft claims can be filed with state labor board',
      ],
      actions: [
        'Document everything: emails, texts, performance reviews',
        'File for unemployment immediately if terminated',
        'Consult an employment lawyer if discrimination/harassment involved',
        'Review your employee handbook for internal appeal process',
      ],
      avoid: [
        'DON\'T quit before consulting a lawyer (may lose unemployment)',
        'DON\'T sign anything without reading carefully',
        'DON\'T post about employer on social media',
      ],
      deadlines: [
        'EEOC complaint: 180-300 days from discrimination incident',
        'Unemployment claim: file within 1 week of termination',
      ],
      followups: [
        'Were you fired or did you quit?',
        'What state are you employed in?',
      ],
      disclaimer: 'Information only • Not legal advice • Consult an employment attorney',
    },
  };

  let answer = mockAnswers[topic] || mockAnswers.TRAFFIC;

  // Add stronger disclaimer for high-stakes
  if (highStakes) {
    answer.disclaimer += ' • THIS IS HIGH-STAKES: Consult a lawyer immediately';
    answer.deadlines.push('⚠️ URGENT: Time-sensitive legal matter - get professional help now');
  }

  // Simulate streaming delay (< 700ms to first token)
  await new Promise(resolve => setTimeout(resolve, 300));

  return answer;
}

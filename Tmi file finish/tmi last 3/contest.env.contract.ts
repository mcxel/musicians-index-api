/**
 * contest.env.contract.ts
 * Repo: apps/api/src/modules/contest/contest.env.contract.ts
 * Action: CREATE | Wave: W5
 * Source: Split from Drop 2 ContestEntities.ts
 *
 * Wiring: Call validateContestEnv() in contest.module.ts:
 *   import { Module, OnModuleInit } from '@nestjs/common';
 *   implements OnModuleInit { onModuleInit() { validateContestEnv(); } }
 */

export function validateContestEnv(): void {
  const required = [
    'CONTEST_REGISTRATION_DAY',
    'CONTEST_REGISTRATION_MONTH',
    'CONTEST_MAX_LOCAL_SPONSORS',
    'CONTEST_MAX_MAJOR_SPONSORS',
  ];

  const missing = required.filter(k => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(`[ContestEnvContract] Missing env vars: ${missing.join(', ')}`);
  }

  const day = parseInt(process.env.CONTEST_REGISTRATION_DAY!);
  const month = parseInt(process.env.CONTEST_REGISTRATION_MONTH!);

  // HARD RULE: August 8 — Marcel's birthday
  if (day !== 8 || month !== 8) {
    throw new Error(
      `[ContestEnvContract] Contest must open August 8 (Marcel's birthday). ` +
      `Got: month=${month} day=${day}. Set CONTEST_REGISTRATION_DAY=8 and CONTEST_REGISTRATION_MONTH=8.`
    );
  }

  const maxLocal = parseInt(process.env.CONTEST_MAX_LOCAL_SPONSORS!);
  const maxMajor = parseInt(process.env.CONTEST_MAX_MAJOR_SPONSORS!);

  if (maxLocal !== 10 || maxMajor !== 10) {
    throw new Error(
      `[ContestEnvContract] CONTEST_MAX_LOCAL_SPONSORS and CONTEST_MAX_MAJOR_SPONSORS must be 10. ` +
      `Got: local=${maxLocal} major=${maxMajor}`
    );
  }
}

// ─── Required env vars to add to apps/api/.env ───────────────────────────────
// CONTEST_REGISTRATION_DAY=8
// CONTEST_REGISTRATION_MONTH=8
// CONTEST_MAX_LOCAL_SPONSORS=10
// CONTEST_MAX_MAJOR_SPONSORS=10
// CONTEST_SEASON_NAME=Grand Platform Contest — Season 1

import path from "node:path";

export const FOUNDRY_ROOT = path.resolve(
  process.cwd(),
  "packages/assets/generated/manufacturing",
);

export const JOBS_DIR = path.join(FOUNDRY_ROOT, "jobs");
export const ARTIFACTS_DIR = path.join(FOUNDRY_ROOT, "artifacts");
export const INTENTS_DIR = path.join(FOUNDRY_ROOT, "intents");
export const REPORTS_DIR = path.join(FOUNDRY_ROOT, "reports");
export const RECIPES_DIR = path.resolve(
  process.cwd(),
  "packages/assets/src/manufacturing/recipes",
);

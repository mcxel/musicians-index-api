export type ProfileIntegrityInput = {
  slug: string;
  bio?: string;
  avatarUrl?: string;
  cameraBound?: boolean;
  payoutConnected?: boolean;
  tier?: string;
};

export type ProfileIntegrityReport = {
  slug: string;
  complete: boolean;
  missing: Array<"avatar" | "bio" | "camera" | "payout" | "tier">;
  score: number;
};

function normalize(slug: string): string {
  return slug.trim().toLowerCase();
}

export function evaluateProfileIntegrity(input: ProfileIntegrityInput): ProfileIntegrityReport {
  const missing: ProfileIntegrityReport["missing"] = [];
  if (!input.avatarUrl) missing.push("avatar");
  if (!input.bio || input.bio.trim().length < 10) missing.push("bio");
  if (!input.cameraBound) missing.push("camera");
  if (!input.payoutConnected) missing.push("payout");
  if (!input.tier) missing.push("tier");

  const score = Math.max(0, 100 - missing.length * 20);

  return {
    slug: normalize(input.slug),
    complete: missing.length === 0,
    missing,
    score,
  };
}

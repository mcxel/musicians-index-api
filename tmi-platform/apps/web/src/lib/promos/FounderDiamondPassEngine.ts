import { PromoCodeEngine } from "./PromoCodeEngine";

export interface DiamondPassHolder {
  email: string;
  name: string;
  grantedBy: string;
  grantedAt: Date;
  code: string;
  tier: "diamond";
  duration: "lifetime";
  role: "fan";
  active: boolean;
}

const FOUNDER_PASSES: DiamondPassHolder[] = [
  {
    // P0 Identity/Entitlement Integrity (2026-08-11/12): the founder's own
    // account. `role: "fan"` below is this list's shared metadata shape
    // (only read by the generic promo-code redemption flow, never by
    // isFounderDiamondEmail()/resolveAuthoritativeTier.ts) — it does not
    // affect his real account role, which is the separate, correct
    // User.role = 'ADMIN'. Subscription tier and administrative authority
    // stay independent dimensions; this entry only grants DIAMOND tier.
    email: "berntmusic33@gmail.com",
    name: "Marcel Dickens",
    grantedBy: "TMI Platform — Founder Account",
    grantedAt: new Date("2026-05-22"),
    code: "DIAMOND-FOUNDER-LIFETIME",
    tier: "diamond",
    duration: "lifetime",
    role: "fan",
    active: true,
  },
  {
    email: "Cyrisaiah24@gmail.com",
    name: "Cyrisaiah",
    grantedBy: "Marcel Dickens — Founder",
    grantedAt: new Date("2026-06-12"),
    code: "DIAMOND-CYRISAIAH-LIFETIME",
    tier: "diamond",
    duration: "lifetime",
    role: "fan",
    active: true,
  },
  {
    email: "leeanncoats.79@gmail.com",
    name: "LeeAnn Coats",
    grantedBy: "Marcel Dickens — Founder",
    grantedAt: new Date("2026-05-10"),
    code: "DIAMOND-LEEANN-LIFETIME",
    tier: "diamond",
    duration: "lifetime",
    role: "fan",
    active: true,
  },
  {
    email: "nacoleelmer143@gmail.com",
    name: "Nacole Elmer",
    grantedBy: "Marcel Dickens — Founder",
    grantedAt: new Date("2026-05-10"),
    code: "DIAMOND-NACOLE-LIFETIME",
    tier: "diamond",
    duration: "lifetime",
    role: "fan",
    active: true,
  },
  {
    email: "mannipaulayton1@gmail.com",
    name: "Manni Paulayton",
    grantedBy: "Marcel Dickens — Founder",
    grantedAt: new Date("2026-06-12"),
    code: "DIAMOND-MANNI-LIFETIME",
    tier: "diamond",
    duration: "lifetime",
    role: "fan",
    active: true,
  },
  {
    email: "greenshean21@gmail.com",
    name: "Green Shean",
    grantedBy: "Marcel Dickens — Founder",
    grantedAt: new Date("2026-06-12"),
    code: "DIAMOND-GREENSHEAN-LIFETIME",
    tier: "diamond",
    duration: "lifetime",
    role: "fan",
    active: true,
  },
  {
    email: "angelinaymoreno@yahoo.com",
    name: "Angelina Moreno",
    grantedBy: "Marcel Dickens — Founder",
    grantedAt: new Date("2026-06-21"),
    code: "DIAMOND-ANGELINA-LIFETIME",
    tier: "diamond",
    duration: "lifetime",
    role: "fan",
    active: true,
  },
  {
    email: "bmccurdy530@gmail.com",
    name: "Brad McCurdy",
    grantedBy: "Marcel Dickens — BerntoutGlobal Founding Promotion & Sales Representative",
    grantedAt: new Date("2026-08-16"),
    code: "DIAMOND-BRADMCCURDY-LIFETIME",
    tier: "diamond",
    duration: "lifetime",
    role: "fan",
    active: true,
  },
];

let initialized = false;

export function initializeFounderDiamondPasses(): void {
  if (initialized) return;
  initialized = true;

  for (const pass of FOUNDER_PASSES) {
    PromoCodeEngine.createCode({
      code: pass.code,
      type: "lifetime_grant",
      tier: "diamond",
      role: "fan",
      duration: "lifetime",
      emails: [pass.email],
      redemptionLimit: 1,
      createdBy: pass.grantedBy,
    });
  }
}

export function getFounderDiamondPasses(): DiamondPassHolder[] {
  return FOUNDER_PASSES;
}

export function isFounderDiamondEmail(email: string): boolean {
  return FOUNDER_PASSES.some(p => p.email.toLowerCase() === email.toLowerCase() && p.active);
}

export function getFounderPassByEmail(email: string): DiamondPassHolder | null {
  return FOUNDER_PASSES.find(p => p.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function getFounderShareLinks(): Array<{ email: string; code: string; link: string }> {
  return FOUNDER_PASSES.map(p => ({
    email: p.email,
    code: p.code,
    link: `https://themusiciansindex.com/promo/${p.code}`,
  }));
}

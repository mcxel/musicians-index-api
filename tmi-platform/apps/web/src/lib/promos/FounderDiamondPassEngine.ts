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

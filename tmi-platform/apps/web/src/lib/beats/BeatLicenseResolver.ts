export type BeatLicenseType = "mp3-lease" | "wav-lease" | "unlimited-lease" | "exclusive-rights";

export type BeatLicenseTerms = {
  type: BeatLicenseType;
  label: string;
  description: string;
  pricingCents: number;
  usageRights: string[];
  limitations: string[];
};

const LICENSE_TERMS: Record<BeatLicenseType, BeatLicenseTerms> = {
  "mp3-lease": {
    type: "mp3-lease",
    label: "MP3 Lease",
    description: "Starter digital lease for demos and social releases.",
    pricingCents: 2999,
    usageRights: [
      "Monetized streaming releases",
      "Music videos and social promo",
      "Live performances",
    ],
    limitations: [
      "MP3 file delivery only",
      "Credit producer in all releases",
      "Non-exclusive license",
      "Maximum 50000 monetized streams",
    ],
  },
  "wav-lease": {
    type: "wav-lease",
    label: "WAV Lease",
    description: "Higher quality lease for commercial launch tracks.",
    pricingCents: 5999,
    usageRights: [
      "All MP3 lease rights",
      "WAV master delivery",
      "Distribution to DSP platforms",
    ],
    limitations: [
      "Non-exclusive license",
      "Maximum 250000 monetized streams",
      "No beat resell",
    ],
  },
  "unlimited-lease": {
    type: "unlimited-lease",
    label: "Unlimited Lease",
    description: "Unlimited stream lease while producer keeps ownership.",
    pricingCents: 14999,
    usageRights: [
      "Unlimited streaming",
      "Broadcast and sync pitch usage",
      "Tour and event performance usage",
    ],
    limitations: [
      "Non-exclusive license",
      "Producer retains master ownership",
      "No beat transfer or sublicense",
    ],
  },
  "exclusive-rights": {
    type: "exclusive-rights",
    label: "Exclusive Rights",
    description: "Full exclusive purchase with removal from marketplace.",
    pricingCents: 69999,
    usageRights: [
      "Unlimited commercial exploitation",
      "Exclusive distribution rights",
      "Stems and full production package",
    ],
    limitations: [
      "Single owner only",
      "Prior leases remain valid",
      "No refund after transfer",
    ],
  },
};

export function resolveLicenseTerms(type: BeatLicenseType): BeatLicenseTerms {
  return LICENSE_TERMS[type];
}

export function listBeatLicenseTerms(): BeatLicenseTerms[] {
  return Object.values(LICENSE_TERMS);
}

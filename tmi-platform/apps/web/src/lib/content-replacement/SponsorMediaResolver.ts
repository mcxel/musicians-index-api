export interface SponsorMediaInput {
  logoUrl?: string;
  productCardUrl?: string;
  promoVideoUrl?: string;
}

export interface SponsorMediaResolution {
  logoUrl: string;
  heroMediaUrl: string;
  heroType: "video" | "image";
}

const SPONSOR_LOGO_FALLBACK = "/sponsors/primeaudio.svg";
const SPONSOR_HERO_FALLBACK = "/tmi-curated/mag-58.jpg";

class SponsorMediaResolver {
  resolve(input: SponsorMediaInput): SponsorMediaResolution {
    if (input.promoVideoUrl) {
      return {
        logoUrl: input.logoUrl ?? SPONSOR_LOGO_FALLBACK,
        heroMediaUrl: input.promoVideoUrl,
        heroType: "video",
      };
    }

    return {
      logoUrl: input.logoUrl ?? SPONSOR_LOGO_FALLBACK,
      heroMediaUrl: input.productCardUrl ?? SPONSOR_HERO_FALLBACK,
      heroType: "image",
    };
  }
}

export const sponsorMediaResolver = new SponsorMediaResolver();

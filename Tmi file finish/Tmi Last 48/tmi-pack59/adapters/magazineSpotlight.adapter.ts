// apps/web/src/adapters/homepage/magazineSpotlight.adapter.ts
// Magazine insert content for the 2-3 minute homepage magazine scene.

export interface IssuePage {
  type: "cover" | "article_spread" | "feature_artist" | "interview" | "game_show_promo" | "cypher_recap" | "awards";
  title: string;
  subtitle?: string;
  imageUrl?: string;
  slug?: string;        // links to /magazine/article/[slug] or /magazine/issues
  cta?: string;
}

export interface MagazineSpotlight {
  issueNumber: number;
  issueTitle: string;
  issueCoverUrl?: string;
  releaseDate: string;
  pages: IssuePage[];   // shown sequentially during the magazine scene
  ctaMessages: string[];
}

export const MAGAZINE_SPOTLIGHT_FALLBACK: MagazineSpotlight = {
  issueNumber: 1,
  issueTitle: "Current Week",
  releaseDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
  pages: [
    { type:"cover",            title:"The Musician's Index",           subtitle:"Current Issue — Who Took The Crown?",                                   cta:"Read the issue" },
    { type:"article_spread",   title:"A Deep Dive into Indie Rock",    subtitle:"This week's featured article",              slug:"deep-dive-indie-rock",  cta:"Read the article" },
    { type:"feature_artist",   title:"Artist of the Week",             subtitle:"Discover this week's breakout talent",      slug:"artist-of-the-week",    cta:"Follow their station" },
    { type:"interview",        title:"The Index Speaks",               subtitle:"Exclusive interview with a rising star",    slug:"the-index-speaks",      cta:"Watch the interview" },
    { type:"game_show_promo",  title:"Game Night — Deal or Feud 1000", subtitle:"Play this week's game show live",                                          cta:"Enter the game" },
    { type:"cypher_recap",     title:"Weekly Cypher Highlights",       subtitle:"Best moments from this week's cyphers",     slug:"weekly-cypher-recap",   cta:"Watch the recap" },
  ],
  ctaMessages: [
    "You're not a musician unless you're in The Musician's Index",
    "Join our magazine now",
    "Log in · Sign up · Be discovered",
    "This is the magazine you should be in",
    "Your stage. Your story. Our magazine.",
    "Get featured — sign up today",
  ],
};

export async function fetchMagazineSpotlight(): Promise<MagazineSpotlight> {
  try {
    // Blackbox: const res = await fetch("/api/magazine/spotlight"); return await res.json();
    return MAGAZINE_SPOTLIGHT_FALLBACK;
  } catch {
    return MAGAZINE_SPOTLIGHT_FALLBACK;
  }
}

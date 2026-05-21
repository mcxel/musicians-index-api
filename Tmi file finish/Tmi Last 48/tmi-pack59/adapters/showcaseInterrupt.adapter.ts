// apps/web/src/adapters/homepage/showcaseInterrupt.adapter.ts
// Show/Game/Event interrupt content for homepage rotation.

export type ShowcaseType = "game_show" | "contest" | "live_show" | "cypher_battle" | "watch_party" | "winners_hall" | "deal_or_feud" | "name_that_tune";

export interface ShowcaseCard {
  type: ShowcaseType;
  title: string;
  subtitle: string;
  status: "upcoming" | "live_now" | "replay" | "coming_soon";
  badgeText: string;
  ctaLabel: string;
  ctaRoute: string;
  prizeText?: string;
  hostName?: string;
  timeUntilMs?: number;   // countdown in ms
  viewerCount?: number;
  imageUrl?: string;
}

export const SHOWCASE_FALLBACK: ShowcaseCard[] = [
  {
    type:"game_show", title:"Game Night", subtitle:"Dirty Dozens — LIVE every Friday",
    status:"upcoming", badgeText:"FRIDAY 9PM", ctaLabel:"SET REMINDER", ctaRoute:"/games",
    prizeText:"Win 500 pts + exclusive badge", hostName:"Vee-Jay 80",
  },
  {
    type:"deal_or_feud", title:"Deal or Feud 1000", subtitle:"Knowledge meets music trivia",
    status:"coming_soon", badgeText:"THIS WEEK", ctaLabel:"ENTER NOW", ctaRoute:"/games/deal-or-feud",
    prizeText:"$50 prize pool", hostName:"Game Show Host",
  },
  {
    type:"winners_hall", title:"Winner's Hall", subtitle:"Crown Champions — All Time",
    status:"replay", badgeText:"HALL OF FAME", ctaLabel:"VIEW WINNERS", ctaRoute:"/hall-of-fame",
  },
  {
    type:"cypher_battle", title:"Cypher Arena", subtitle:"1v1 battles — vote for your winner",
    status:"live_now", badgeText:"● LIVE NOW", ctaLabel:"WATCH + VOTE", ctaRoute:"/cypher",
    viewerCount: 312,
  },
  {
    type:"name_that_tune", title:"Name That Tune", subtitle:"Identify the track, win the round",
    status:"upcoming", badgeText:"DAILY 8PM", ctaLabel:"JOIN THE QUEUE", ctaRoute:"/games/name-that-tune",
    prizeText:"250 pts per win",
  },
];

export async function fetchShowcaseCards(): Promise<ShowcaseCard[]> {
  try {
    // Blackbox: const res = await fetch("/api/shows/featured"); return await res.json();
    return SHOWCASE_FALLBACK;
  } catch {
    return SHOWCASE_FALLBACK;
  }
}

// Picks one showcase card to display during the interrupt scene
export function pickShowcaseCard(cards: ShowcaseCard[]): ShowcaseCard {
  // Prioritize: live_now > upcoming > coming_soon > replay
  const prioritized = [...cards].sort((a, b) => {
    const order = { live_now:0, upcoming:1, coming_soon:2, replay:3 };
    return (order[a.status] ?? 4) - (order[b.status] ?? 4);
  });
  // Pick with slight randomness so same card doesn't always show
  const top = prioritized.slice(0, 2);
  return top[Math.floor(Math.random() * top.length)];
}

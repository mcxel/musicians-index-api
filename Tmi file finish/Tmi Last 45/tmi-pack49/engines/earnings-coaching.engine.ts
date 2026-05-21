// packages/coaching-engine/src/earnings-coaching.engine.ts
// Platform Law #11: Coaching sticky notes on artist dashboard

export interface CoachingNote {
  id: string;
  category: "revenue" | "discovery" | "engagement" | "sponsor" | "timing";
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  isDismissable: boolean;
  expiresAt?: Date;
}

export function getCoachingNotes(artistData: {
  stationSlug?: string;
  hasMotionCard: boolean;
  articlesThisWeek: number;
  streamHoursThisWeek: number;
  sponsorTasksComplete: number;
  totalSponsors: number;
  walletBalance: number;
  followersCount: number;
  lastLiveAt?: Date;
}): CoachingNote[] {
  const notes: CoachingNote[] = [];

  if (!artistData.stationSlug) {
    notes.push({ id:"no-station", category:"discovery", priority:"critical",
      title:"Set Up Your Station!", body:"Your station links your articles to your profile. Required for discovery.",
      ctaLabel:"Add Station Slug", ctaUrl:"/dashboard/artist/settings", isDismissable:false });
  }

  if (!artistData.hasMotionCard) {
    notes.push({ id:"no-motion-card", category:"engagement", priority:"high",
      title:"Upload Your 3-Second Motion Card", body:"Artists with motion cards get 3× more clicks on Home 1.",
      ctaLabel:"Upload Motion Card", ctaUrl:"/dashboard/artist/uploads", isDismissable:true });
  }

  if (artistData.articlesThisWeek === 0) {
    notes.push({ id:"no-articles", category:"discovery", priority:"high",
      title:"Write an Article This Week", body:"Articles appear in the Editorial Belt and boost your discovery score.",
      ctaLabel:"Write Article", ctaUrl:"/dashboard/artist/articles/new", isDismissable:true });
  }

  if (artistData.totalSponsors > 0 && artistData.sponsorTasksComplete < artistData.totalSponsors) {
    notes.push({ id:"sponsor-tasks", category:"sponsor", priority:"critical",
      title:"Sponsor Tasks Waiting!", body:`You have ${artistData.totalSponsors - artistData.sponsorTasksComplete} sponsor task(s) to complete to earn your rewards.`,
      ctaLabel:"View Sponsor Tasks", ctaUrl:"/dashboard/artist/sponsors", isDismissable:false });
  }

  const daysSinceLive = artistData.lastLiveAt
    ? (Date.now() - artistData.lastLiveAt.getTime()) / (1000 * 60 * 60 * 24)
    : 999;
  if (daysSinceLive > 7) {
    notes.push({ id:"no-live", category:"engagement", priority:"medium",
      title:"Go Live This Week", body:"Artists who stream weekly earn 40% more discovery points.",
      ctaLabel:"Schedule a Show", ctaUrl:"/dashboard/artist/studio", isDismissable:true });
  }

  return notes.sort((a, b) => {
    const order = { critical:0, high:1, medium:2, low:3 };
    return order[a.priority] - order[b.priority];
  }).slice(0, 10); // max 10 notes visible at once
}

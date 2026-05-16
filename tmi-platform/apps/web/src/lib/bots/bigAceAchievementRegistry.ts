export type BigAceAchievement = {
  id: string;
  title: string;
  preApproved: boolean;
  progress: "queued" | "in-progress" | "completed";
};

export const BIG_ACE_PREAPPROVED_ACHIEVEMENTS: BigAceAchievement[] = [
  { id: "stability", title: "Improve system stability", preApproved: true, progress: "in-progress" },
  { id: "dispatch", title: "Dispatch bots to test and report", preApproved: true, progress: "queued" },
  { id: "growth-sims", title: "Fund approved growth simulations", preApproved: true, progress: "queued" },
  { id: "infra", title: "Support platform infrastructure", preApproved: true, progress: "in-progress" },
  { id: "sentinels", title: "Strengthen moderation/sentinel systems", preApproved: true, progress: "in-progress" },
  { id: "admin-routing", title: "Improve admin/monitor routing", preApproved: true, progress: "queued" },
  { id: "visual-parity", title: "Help build TMI visual parity", preApproved: true, progress: "queued" },
  { id: "onboarding", title: "Support onboarding readiness", preApproved: true, progress: "queued" },
  { id: "route-health", title: "Track route, feed, and control health", preApproved: true, progress: "in-progress" },
  { id: "recommend-upgrades", title: "Recommend upgrades before spending", preApproved: true, progress: "queued" },
];

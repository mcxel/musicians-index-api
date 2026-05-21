// apps/web/src/config/coaching-rules.ts
// Artist coaching sticky notes shown on dashboard and profile owner view.

export type CoachingNote = {
  id: string;
  message: string;
  type: "sponsor" | "earnings" | "discovery" | "content" | "live";
  priority: number;  // 1 = highest
  condition?: string; // when to show this note
};

export const COACHING_NOTES: CoachingNote[] = [
  {
    id: "sponsor-thank",
    message: "Thank your sponsor this week to improve your renewal chances.",
    type: "sponsor",
    priority: 1,
    condition: "has_active_sponsor",
  },
  {
    id: "sponsor-promote",
    message: "Promote your sponsor's product in your next post to unlock more local visibility.",
    type: "sponsor",
    priority: 2,
    condition: "has_active_sponsor",
  },
  {
    id: "local-economy",
    message: "Artists who promote local sponsors get more funding. Local stores want artists who show love back.",
    type: "sponsor",
    priority: 3,
    condition: "has_local_sponsor",
  },
  {
    id: "article-update",
    message: "Update your article this week to improve sponsor attention and discovery ranking.",
    type: "content",
    priority: 4,
    condition: "article_older_than_7_days",
  },
  {
    id: "go-live",
    message: "Go live this week to improve your discovery ranking and Stream & Win score.",
    type: "live",
    priority: 5,
    condition: "no_live_session_this_week",
  },
  {
    id: "complete-profile",
    message: "Complete your artist profile to unlock more sponsor opportunities.",
    type: "discovery",
    priority: 6,
    condition: "profile_incomplete",
  },
];

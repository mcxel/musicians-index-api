// packages/push-notifications/src/push.service.ts
// iOS (APNS), Android (FCM), Web Push (VAPID)

export type PushProvider = "fcm" | "apns" | "web_push";
export type PushPriority = "high" | "normal" | "low";

export interface PushPayload {
  userId: string;
  title: string;
  body: string;
  imageUrl?: string;
  actionUrl?: string;
  data?: Record<string, string>;
  priority?: PushPriority;
  badge?: number;   // iOS badge count
  sound?: string;   // notification sound
  ttl?: number;     // seconds before expiry
  collapseKey?: string; // replace duplicate notifications
}

export interface PushToken {
  userId: string;
  token: string;
  platform: "ios" | "android" | "web";
  isActive: boolean;
  lastUsedAt: Date;
}

// ── FCM (Android + Web) ────────────────────────────────
export async function sendFCM(payload: PushPayload, tokens: string[]): Promise<void> {
  // Use firebase-admin SDK
  // firebase.messaging().sendEachForMulticast({ tokens, notification: { title, body }, data })
  console.log(`[FCM] Send to ${tokens.length} devices: ${payload.title}`);
}

// ── APNS (iOS) ─────────────────────────────────────────
export async function sendAPNS(payload: PushPayload, deviceTokens: string[]): Promise<void> {
  // Use node-apn or @parse/node-apn
  console.log(`[APNS] Send to ${deviceTokens.length} iOS devices: ${payload.title}`);
}

// ── WEB PUSH (browsers/PWA) ──────────────────────────
export async function sendWebPush(payload: PushPayload, subscriptions: PushSubscription[]): Promise<void> {
  // Use web-push library with VAPID keys
  console.log(`[WebPush] Send to ${subscriptions.length} web subscribers`);
}

// ── PLATFORM TRIGGERS (when to send what) ─────────────
export const PUSH_TRIGGERS = {
  "artist_live":          { title: "{artistName} is LIVE!",          body: "Join now on The Musician's Index", priority: "high" },
  "crown_awarded":        { title: "👑 New Crown Winner!",           body: "{artistName} just won the crown!",  priority: "high" },
  "ticket_confirmed":     { title: "🎫 Your tickets are confirmed!",  body: "Event: {eventName}",               priority: "high" },
  "reward_unlocked":      { title: "🎁 You got a reward!",           body: "{rewardName} added to inventory",   priority: "normal" },
  "friend_joined":        { title: "{friendName} joined TMI!",        body: "You earned 30 points for the referral", priority: "low" },
  "game_starting":        { title: "⚡ Game Starting NOW!",           body: "{gameName} — join before it's full", priority: "high" },
  "sponsor_task":         { title: "New sponsor task available",       body: "Complete it to earn more",         priority: "normal" },
  "payout_approved":      { title: "💰 Payout approved by Big Ace",  body: "{amountStr} on its way",            priority: "high" },
} as const;

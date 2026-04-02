// PACK 43: REWARD ROUTES — All new pages and API endpoints

export const REWARD_ROUTES = {
  // ── MEMBER PAGES ──────────────────────────────────────
  rewards:              "/rewards",
  inventory:            "/inventory",
  inventoryAvatar:      "/inventory/avatar",
  inventoryPrizes:      "/inventory/prizes",
  claims:               "/claims",
  giveaways:            "/giveaways",
  badges:               "/badges",
  drops:                "/drops",

  // ── LIVE PAGES ────────────────────────────────────────
  liveRewards:          "/live/rewards",
  liveGiveaways:        "/live/giveaways",
  liveWinners:          "/live/winners",

  // ── SPONSOR PAGES ─────────────────────────────────────
  sponsorRewards:       "/sponsor/rewards",
  sponsorDrops:         "/sponsor/drops",
  sponsorPrizeCampaigns:"/sponsor/prize-campaigns",

  // ── ADMIN PAGES ───────────────────────────────────────
  adminRewards:         "/admin/rewards",
  adminGiveaways:       "/admin/giveaways",
  adminPrizeClaims:     "/admin/prize-claims",
  adminRewardRules:     "/admin/reward-rules",
  adminRewardFraud:     "/admin/reward-fraud",
  adminAvatarItems:     "/admin/avatar-items",

  // ── API ENDPOINTS ─────────────────────────────────────
  api: {
    triggerDrop:        "POST /api/rewards/drop",
    claimReward:        "POST /api/rewards/claim",
    myRewards:          "GET  /api/rewards/mine",
    myInventory:        "GET  /api/rewards/inventory",
    equipItem:          "POST /api/rewards/equip",
    promptCreate:       "POST /api/rewards/prompt",
    promptSubmit:       "POST /api/rewards/prompt/:id/submit",
    dropTables:         "GET  /api/rewards/drop-tables",
    giftItem:           "POST /api/rewards/gift",          // host/mod manual gift
    fraudQueue:         "GET  /api/rewards/fraud-queue",
  },

  // ── NEW WORKER QUEUES ────────────────────────────────
  queues: [
    "tmi:reward-drop",        // process reward drop events
    "tmi:winner-selection",   // select winners from eligible pool
    "tmi:reward-fulfillment", // execute the fulfillment chain
    "tmi:fraud-review",       // review suspicious claims
    "tmi:avatar-grant",       // add avatar item to inventory
    "tmi:coupon-issue",       // generate and send coupon codes
  ],

  // ── NEW BOTS ─────────────────────────────────────────
  newBots: [
    "giveaway-bot",           // fires random audience drops
    "audience-reward-bot",    // manages live prompts
    "sponsor-drop-bot",       // fires sponsor-triggered drops
    "reward-fairness-bot",    // monitors for suspicious patterns
    "prize-fulfillment-bot",  // processes fulfillment chain
    "avatar-reward-bot",      // handles avatar item grants
    "live-prompt-bot",        // fires timed trivia/reaction challenges
    "winners-announcement-bot",// posts winner shoutouts in room chat
  ],
} as const;

// lib/stripe/products.ts — Canonical TMI product + price ID constants
// To activate a subscription tier: create the product in Stripe Dashboard,
// then set the corresponding STRIPE_PRICE_* env var in Vercel.
// All subscription tiers fall back to inline price_data so checkout works immediately
// even without real price IDs — no Stripe configuration required to start collecting.

export const STRIPE_PRODUCTS = {
  // ── Fan subscriptions ─────────────────────────────────────────────────────
  FAN_RUBY_MONTHLY: {
    productId: "prod_fan_ruby",
    priceId:   process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_RUBY ?? "price_fan_ruby",
    name:      "TMI Fan — Ruby",
    price:     499,  // $4.99/mo
    interval:  "month" as const,
    features:  ["All live rooms","Chat + reactions","Tip performers","Monthly magazine","XP + achievements"],
  },
  FAN_SILVER_MONTHLY: {
    productId: "prod_fan_silver",
    priceId:   process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_SILVER ?? "price_fan_silver",
    name:      "TMI Fan — Silver",
    price:     999,  // $9.99/mo
    interval:  "month" as const,
    features:  ["Everything in Ruby","Early access drops","Fan leaderboard placement","Silver avatar glow"],
  },
  FAN_GOLD_MONTHLY: {
    productId: "prod_fan_gold",
    priceId:   process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_GOLD ?? "price_fan_gold",
    name:      "TMI Fan — Gold",
    price:     1499, // $14.99/mo
    interval:  "month" as const,
    features:  ["Everything in Silver","Exclusive fan rooms","Gold avatar glow","Priority merch drops"],
  },
  FAN_PLATINUM_MONTHLY: {
    productId: "prod_fan_platinum",
    priceId:   process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_PLATINUM ?? "price_fan_platinum",
    name:      "TMI Fan — Platinum",
    price:     2499, // $24.99/mo
    interval:  "month" as const,
    features:  ["Everything in Gold","Backstage passes","Direct artist DMs","Platinum badge"],
  },
  FAN_DIAMOND_MONTHLY: {
    productId: "prod_fan_diamond",
    priceId:   process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_DIAMOND ?? "price_1TUWI4EL7B8tMf4NHs74ydgc",
    name:      "TMI Fan — Diamond",
    price:     4999, // $49.99/mo
    interval:  "month" as const,
    features:  ["All Platinum perks","NFT access","VIP front-row seats","Diamond avatar glow","Season Zero recognition"],
  },
  FAN_FAMILY_MONTHLY: {
    productId: "prod_fan_family",
    priceId:   process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_FAMILY ?? "price_fan_family",
    name:      "TMI Fan — Family",
    price:     2799, // $27.99/mo — up to 4 accounts
    interval:  "month" as const,
    features:  ["Gold Fan perks for up to 4 accounts","Shared fan room","Family badge"],
  },

  // ── Performer subscriptions ───────────────────────────────────────────────
  PERFORMER_RUBY_MONTHLY: {
    productId: "prod_performer_ruby",
    priceId:   process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_RUBY ?? "price_performer_ruby",
    name:      "TMI Performer — Ruby",
    price:     299,  // $2.99/mo
    interval:  "month" as const,
    features:  ["Go live anytime","Beat marketplace access","Booking requests","Analytics dashboard"],
  },
  PERFORMER_SILVER_MONTHLY: {
    productId: "prod_performer_silver",
    priceId:   process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_SILVER ?? "price_performer_silver",
    name:      "TMI Performer — Silver",
    price:     499,  // $4.99/mo
    interval:  "month" as const,
    features:  ["Everything in Ruby","Fan club tools","Tipping enabled","Merch store access","Silver badge"],
  },
  PERFORMER_GOLD_MONTHLY: {
    productId: "prod_performer_gold",
    priceId:   process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_GOLD ?? "price_performer_gold",
    name:      "TMI Performer — Gold",
    price:     999,  // $9.99/mo
    interval:  "month" as const,
    features:  ["Everything in Silver","Priority placement","Billboard rotation","Gold performer badge"],
  },
  PERFORMER_PLATINUM_MONTHLY: {
    productId: "prod_performer_platinum",
    priceId:   process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_PLATINUM ?? "price_performer_platinum",
    name:      "TMI Performer — Platinum",
    price:     1999, // $19.99/mo
    interval:  "month" as const,
    features:  ["Everything in Gold","NFT minting rights","Unlimited uploads","Tour booking tools","Platinum badge"],
  },
  PERFORMER_DIAMOND_MONTHLY: {
    productId: "prod_performer_diamond",
    priceId:   process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_DIAMOND ?? "price_performer_diamond",
    name:      "TMI Performer — Diamond",
    price:     2999, // $29.99/mo
    interval:  "month" as const,
    features:  ["All Platinum perks","Priority booking","Full revenue split access","Diamond badge","NFT minting"],
  },
  PERFORMER_BAND_MONTHLY: {
    productId: "prod_performer_band",
    priceId:   process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_BAND ?? "price_performer_band",
    name:      "TMI Performer — Band/Group Diamond",
    price:     2499, // $24.99/mo — up to 5 members
    interval:  "month" as const,
    features:  ["Diamond Performer perks","Up to 5 linked members","Shared live room","Band profile page"],
  },

  // ── Support economy ───────────────────────────────────────────────────────
  SUPPORT_PERFORMER_MONTHLY: {
    productId: "prod_support_performer",
    priceId:   process.env.NEXT_PUBLIC_STRIPE_PRICE_SUPPORT_BASIC ?? "price_support_performer",
    name:      "Support This Performer",
    price:     299,  // $2.99/mo
    interval:  "month" as const,
  },
  SUPER_SUPPORTER_MONTHLY: {
    productId: "prod_super_supporter",
    priceId:   process.env.NEXT_PUBLIC_STRIPE_PRICE_SUPPORT_SUPER ?? "price_super_supporter",
    name:      "Super Supporter",
    price:     499,  // $4.99/mo
    interval:  "month" as const,
  },

  // ── Tips ─────────────────────────────────────────────────────────────────
  TIP_SMALL:  { productId: "prod_tip", priceId: "price_tip_small",  name: "Tip $1",   price: 100  },
  TIP_MEDIUM: { productId: "prod_tip", priceId: "price_1TUWKrEL7B8tMf4NVceVcW4i", name: "Tip $5",   price: 500  },
  TIP_LARGE:  { productId: "prod_tip", priceId: "price_tip_large",  name: "Tip $10",  price: 1000 },
  TIP_XL:     { productId: "prod_tip", priceId: "price_tip_xl",     name: "Tip $25",  price: 2500 },
  TIP_XXL:    { productId: "prod_tip", priceId: "price_tip_xxl",    name: "Tip $50",  price: 5000 },

  // ── Sponsor placements ────────────────────────────────────────────────────
  SPONSOR_HOMEPAGE_BANNER: {
    productId: "prod_sponsor_banner",
    priceId:   process.env.STRIPE_PRICE_SPONSOR_BANNER ?? "price_sponsor_homepage_banner",
    name:      "Homepage Banner Sponsorship",
    price:     29900, // $299/mo
    interval:  "month" as const,
  },
  SPONSOR_ROOM_NAMING: {
    productId: "prod_sponsor_room",
    priceId:   process.env.STRIPE_PRICE_SPONSOR_ROOM ?? "price_sponsor_room_naming",
    name:      "Sponsored Room",
    price:     14900, // $149/mo
    interval:  "month" as const,
  },
  SPONSOR_CONTEST: {
    productId: "prod_sponsor_contest",
    priceId:   process.env.STRIPE_PRICE_SPONSOR_CONTEST ?? "price_sponsor_contest",
    name:      "Contest Sponsorship",
    price:     49900, // $499 per contest
    interval:  "one_time" as const,
  },
  SPONSOR_ARTICLE_PLACEMENT: {
    productId: "prod_sponsor_article",
    priceId:   process.env.STRIPE_PRICE_SPONSOR_ARTICLE ?? "price_sponsor_article",
    name:      "Featured Article Placement",
    price:     9900, // $99
    interval:  "one_time" as const,
  },
  SPONSOR_BATTLE: {
    productId: "prod_sponsor_battle",
    priceId:   process.env.STRIPE_PRICE_SPONSOR_BATTLE ?? "price_sponsor_battle",
    name:      "Battle Sponsorship",
    price:     14900, // $149 per battle
    interval:  "one_time" as const,
  },
  SPONSOR_CHAMPIONSHIP: {
    productId: "prod_sponsor_championship",
    priceId:   process.env.STRIPE_PRICE_SPONSOR_CHAMPIONSHIP ?? "price_sponsor_championship",
    name:      "Championship Sponsorship",
    price:     99900, // $999 per championship
    interval:  "one_time" as const,
  },

  // ── Advertiser ad slots ───────────────────────────────────────────────────
  AD_BILLBOARD_WEEKLY: {
    productId: "prod_ad_billboard",
    priceId:   process.env.STRIPE_PRICE_AD_BILLBOARD ?? "price_ad_billboard_weekly",
    name:      "Billboard Ad Slot (1 week)",
    price:     14900, // $149/wk
    interval:  "week" as const,
  },
  AD_BANNER_MONTHLY: {
    productId: "prod_ad_banner",
    priceId:   process.env.STRIPE_PRICE_AD_BANNER ?? "price_ad_banner_monthly",
    name:      "Page Banner Ad (1 month)",
    price:     9900, // $99/mo
    interval:  "month" as const,
  },
  AD_TICKER_MONTHLY: {
    productId: "prod_ad_ticker",
    priceId:   process.env.STRIPE_PRICE_AD_TICKER ?? "price_ad_ticker_monthly",
    name:      "Homepage Ticker Ad (1 month)",
    price:     4900, // $49/mo
    interval:  "month" as const,
  },
  AD_VIDEO_WEEKLY: {
    productId: "prod_ad_video",
    priceId:   process.env.STRIPE_PRICE_AD_VIDEO ?? "price_ad_video_weekly",
    name:      "Video Ad Slot (1 week)",
    price:     24900, // $249/wk
    interval:  "week" as const,
  },
  AD_MAGAZINE: {
    productId: "prod_ad_magazine",
    priceId:   process.env.STRIPE_PRICE_AD_MAGAZINE ?? "price_ad_magazine",
    name:      "Magazine Ad Placement",
    price:     9900, // $99 per issue
    interval:  "one_time" as const,
  },

  // ── Artist upgrades ───────────────────────────────────────────────────────
  ARTIST_SPOTLIGHT: {
    productId: "prod_artist_spotlight",
    priceId:   process.env.STRIPE_PRICE_ARTIST_SPOTLIGHT ?? "price_artist_spotlight",
    name:      "Homepage Artist Spotlight",
    price:     4900, // $49 per feature
    interval:  "one_time" as const,
  },
  ARTIST_BOOST: {
    productId: "prod_artist_boost",
    priceId:   process.env.STRIPE_PRICE_ARTIST_BOOST ?? "price_artist_boost",
    name:      "Artist Discovery Boost (7 days)",
    price:     1900, // $19
    interval:  "one_time" as const,
  },
  BEAT_FEATURED: {
    productId: "prod_beat_featured",
    priceId:   process.env.STRIPE_PRICE_BEAT_FEATURED ?? "price_beat_featured",
    name:      "Beat Marketplace Featured Placement",
    price:     999, // $9.99
    interval:  "one_time" as const,
  },

  // ── Venue / booking ───────────────────────────────────────────────────────
  BOOKING_PLATFORM_FEE: {
    productId: "prod_booking_fee",
    priceId:   process.env.STRIPE_PRICE_BOOKING_FEE ?? "price_booking_fee",
    name:      "Booking Platform Fee",
    price:     999,  // $9.99 per booking
    interval:  "one_time" as const,
  },
  TICKET_STANDARD: { productId:"prod_ticket", priceId: process.env.STRIPE_PRICE_TICKET_STANDARD ?? "price_ticket_standard", name:"Event Ticket (Standard)", price:500,  interval:"one_time" as const },
  TICKET_VIP:      { productId:"prod_ticket", priceId: process.env.STRIPE_PRICE_TICKET_VIP ?? "price_ticket_vip",           name:"Event Ticket (VIP)",      price:1500, interval:"one_time" as const },
  VENUE_PROMOTION: { productId:"prod_venue_promo", priceId: process.env.STRIPE_PRICE_VENUE_PROMO ?? "price_venue_promotion", name:"Venue Promotion (1 month)", price:4900, interval:"month" as const },

  // ── Meet & Greet / Shoutouts ──────────────────────────────────────────────
  MEET_GREET: {
    productId: "prod_meet_greet",
    priceId:   process.env.STRIPE_PRICE_MEET_GREET ?? "price_1TUWSaEL7B8tMf4N74LrAyG",
    name:      "Artist Meet & Greet",
    price:     2500, // $25
    interval:  "one_time" as const,
  },
  SHOUTOUT: {
    productId: "prod_shoutout",
    priceId:   process.env.STRIPE_PRICE_SHOUTOUT ?? "price_1TUWvpEL7B8tMf4Ns2TE2uX4",
    name:      "Personalized Artist Shoutout",
    price:     1500, // $15
    interval:  "one_time" as const,
  },
  QUICK_VIDEO_CHAT: {
    productId: "prod_quick_video_chat",
    priceId:   process.env.STRIPE_PRICE_VIDEO_CHAT ?? "price_quick_video_chat",
    name:      "Quick Video Chat (15 min)",
    price:     800,  // $8
    interval:  "one_time" as const,
  },
  BACKSTAGE_PASS: {
    productId: "prod_backstage_pass",
    priceId:   process.env.STRIPE_PRICE_BACKSTAGE_PASS ?? "price_backstage_pass",
    name:      "Digital Backstage Pass",
    price:     1500, // $15
    interval:  "one_time" as const,
  },

  // ── Seat Upgrades ─────────────────────────────────────────────────────────
  SEAT_UPGRADE_1:  { productId:"prod_seat_upgrade", priceId: process.env.STRIPE_PRICE_SEAT_1 ?? "price_seat_upgrade_1",   name:"Move up 1 seat",    price:100,  interval:"one_time" as const },
  SEAT_UPGRADE_5:  { productId:"prod_seat_upgrade", priceId: process.env.STRIPE_PRICE_SEAT_5 ?? "price_seat_upgrade_5",   name:"Move up 5 seats",   price:400,  interval:"one_time" as const },
  SEAT_FRONT_ROW:  { productId:"prod_seat_upgrade", priceId: process.env.STRIPE_PRICE_SEAT_FRONT ?? "price_seat_front_row", name:"Move to front row", price:1000, interval:"one_time" as const },
  SEAT_VIP_JUMP:   { productId:"prod_seat_upgrade", priceId: process.env.STRIPE_PRICE_SEAT_VIP ?? "price_seat_vip_jump",   name:"VIP seat jump",     price:2000, interval:"one_time" as const },

  // ── Beat marketplace ──────────────────────────────────────────────────────
  BEAT_LEASE_BASIC:      { productId:"prod_beat", priceId: process.env.STRIPE_PRICE_BEAT_BASIC ?? "price_beat_basic",         name:"Beat Basic Lease",      price:2900,  interval:"one_time" as const },
  BEAT_LEASE_PREMIUM:    { productId:"prod_beat", priceId: process.env.STRIPE_PRICE_BEAT_PREMIUM ?? "price_beat_premium",     name:"Beat Premium Lease",    price:5900,  interval:"one_time" as const },
  BEAT_LEASE_EXCLUSIVE:  { productId:"prod_beat", priceId: process.env.STRIPE_PRICE_BEAT_EXCLUSIVE ?? "price_beat_exclusive", name:"Beat Exclusive Buyout", price:49900, interval:"one_time" as const },
  BEAT_LICENSE:          { productId:"prod_beat", priceId: process.env.STRIPE_PRICE_BEAT_LICENSE ?? "price_beat_license",     name:"Beat License",          price:2500,  interval:"one_time" as const },
  NFT_MINT_FEE:          { productId:"prod_nft",  priceId: process.env.STRIPE_PRICE_NFT_MINT ?? "price_nft_mint_fee",         name:"NFT Mint Fee",          price:999,   interval:"one_time" as const },
  NFT_PURCHASE:          { productId:"prod_nft",  priceId: process.env.STRIPE_PRICE_NFT_PURCHASE ?? "price_nft_purchase",     name:"NFT Purchase",          price:9900,  interval:"one_time" as const },

  // ── Founding packs (Beta Season one-time) ────────────────────────────────
  FOUNDING_SUPPORTER:  { productId:"prod_founding", priceId: process.env.STRIPE_PRICE_FOUNDING_5 ?? "price_founding_supporter_5",   name:"Founding Supporter Pack", price:500,  interval:"one_time" as const },
  FOUNDING_CREATOR:    { productId:"prod_founding", priceId: process.env.STRIPE_PRICE_FOUNDING_15 ?? "price_founding_creator_15",   name:"Founding Creator Pack",   price:1500, interval:"one_time" as const },
  FOUNDING_MEMBER:     { productId:"prod_founding", priceId: process.env.STRIPE_PRICE_FOUNDING_25 ?? "price_founding_member_25",    name:"Founding Member Pack",    price:2500, interval:"one_time" as const },
  FOUNDING_DIAMOND:    { productId:"prod_founding", priceId: process.env.STRIPE_PRICE_FOUNDING_50 ?? "price_diamond_founder_50",    name:"Diamond Founder Pack",    price:5000, interval:"one_time" as const },

  // ── DJ / event submissions ────────────────────────────────────────────────
  DJ_SUBMISSION:       { productId:"prod_dj_sub",   priceId: process.env.STRIPE_PRICE_DJ_SUBMISSION ?? "price_dj_submission",       name:"DJ Track Submission",     price:499,  interval:"one_time" as const },
} as const;

// Platform revenue split percentages
export const REVENUE_SPLITS = {
  SUBSCRIPTION:     { platform: 0.20, creator: 0.80 },
  TIP:              { platform: 0.10, creator: 0.90 },
  BOOKING:          { platform: 0.15, venue: 0.85 },
  TICKET:           { platform: 0.10, artist: 0.90 },
  BEAT_LICENSE:     { platform: 0.25, producer: 0.75 },
  NFT:              { platform: 0.10, artist: 0.90 },
  SPONSOR:          { platform: 1.00 },
  ADVERTISER:       { platform: 1.00 },
  ARTIST_SPOTLIGHT: { platform: 1.00 },
  FAN_CLUB:         { platform: 0.15, artist: 0.85 },
  MEET_GREET:       { platform: 0.20, artist: 0.80 },
  SHOUTOUT:         { platform: 0.20, artist: 0.80 },
  QUICK_VIDEO_CHAT: { platform: 0.20, artist: 0.80 },
  BACKSTAGE_PASS:   { platform: 0.20, artist: 0.80 },
} as const;

export type StripeProductKey = keyof typeof STRIPE_PRODUCTS;

// ── Price ID helpers ──────────────────────────────────────────────────────────
// Real Stripe price IDs match the format price_1<alphanum>
// Placeholder IDs are human-readable strings that will be rejected by Stripe

export function isRealPriceId(priceId: string): boolean {
  return /^price_1[A-Za-z0-9]{14,}$/.test(priceId);
}

// Returns only the products that have real Stripe price IDs (safe to checkout)
export function getWorkingProducts(): Array<{
  key: StripeProductKey;
  name: string;
  price: number;
  priceId: string;
  interval?: string;
}> {
  return (Object.entries(STRIPE_PRODUCTS) as [StripeProductKey, typeof STRIPE_PRODUCTS[StripeProductKey]][])
    .filter(([, p]) => isRealPriceId(p.priceId))
    .map(([key, p]) => ({
      key,
      name: p.name,
      price: p.price,
      priceId: p.priceId,
      interval: 'interval' in p ? p.interval : undefined,
    }));
}

// Returns all products with a flag indicating whether the price ID is active
export function getProductAudit(): Array<{
  key: StripeProductKey;
  name: string;
  price: number;
  priceId: string;
  isReal: boolean;
}> {
  return (Object.entries(STRIPE_PRODUCTS) as [StripeProductKey, typeof STRIPE_PRODUCTS[StripeProductKey]][])
    .map(([key, p]) => ({
      key,
      name: p.name,
      price: p.price,
      priceId: p.priceId,
      isReal: isRealPriceId(p.priceId),
    }));
}


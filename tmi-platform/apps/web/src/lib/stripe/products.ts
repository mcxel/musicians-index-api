// lib/stripe/products.ts — All Stripe product + price ID constants for TMI platform
// Replace placeholder IDs with real Stripe Dashboard IDs before going live

export const STRIPE_PRODUCTS = {
  // ── Subscriptions ────────────────────────────────────────────────────────
  MEMBER_PRO_MONTHLY: {
    productId: "prod_member_pro",
    priceId:   "price_member_pro_monthly",
    name:      "TMI Member Pro",
    price:     999,  // $9.99/mo
    interval:  "month" as const,
    features:  ["All live rooms","Priority chat","HD streams","Monthly bonus XP","No ads"],
  },
  MEMBER_VIP_MONTHLY: {
    productId: "prod_member_vip",
    priceId:   "price_member_vip_monthly",
    name:      "TMI Member VIP",
    price:     1999, // $19.99/mo
    interval:  "month" as const,
    features:  ["Everything in Pro","VIP room access","Monthly spotlight badge","Exclusive artist drops","Early access contests"],
  },
  ARTIST_PRO_MONTHLY: {
    productId: "prod_artist_pro",
    priceId:   "price_artist_pro_monthly",
    name:      "TMI Artist Pro",
    price:     1499, // $14.99/mo
    interval:  "month" as const,
    features:  ["Verified artist badge","Full Beat Lab access","NFT minting","Profile analytics","Priority booking listing"],
  },
  SEASON_PASS: {
    productId: "prod_season_pass",
    priceId:   "price_season_pass",
    name:      "TMI Season Pass",
    price:     4999, // $49.99 one-time
    interval:  "one_time" as const,
    features:  ["All season events","VIP room access","Exclusive merch drop","Season champion eligibility","Commemorative NFT"],
  },

  // ── Tips ─────────────────────────────────────────────────────────────────
  TIP_SMALL:  { productId: "prod_tip", priceId: "price_tip_small",  name: "Tip $1",   price: 100  },
  TIP_MEDIUM: { productId: "prod_tip", priceId: "price_tip_medium", name: "Tip $5",   price: 500  },
  TIP_LARGE:  { productId: "prod_tip", priceId: "price_tip_large",  name: "Tip $10",  price: 1000 },
  TIP_XL:     { productId: "prod_tip", priceId: "price_tip_xl",     name: "Tip $25",  price: 2500 },
  TIP_XXL:    { productId: "prod_tip", priceId: "price_tip_xxl",    name: "Tip $50",  price: 5000 },

  // ── Sponsor placements ────────────────────────────────────────────────────
  SPONSOR_HOMEPAGE_BANNER: {
    productId: "prod_sponsor_banner",
    priceId:   "price_sponsor_homepage_banner",
    name:      "Homepage Banner Sponsorship",
    price:     29900, // $299/mo
    interval:  "month" as const,
  },
  SPONSOR_ROOM_NAMING: {
    productId: "prod_sponsor_room",
    priceId:   "price_sponsor_room_naming",
    name:      "Sponsored Room",
    price:     14900, // $149/mo
    interval:  "month" as const,
  },
  SPONSOR_CONTEST: {
    productId: "prod_sponsor_contest",
    priceId:   "price_sponsor_contest",
    name:      "Contest Sponsorship",
    price:     49900, // $499 per contest
    interval:  "one_time" as const,
  },
  SPONSOR_ARTICLE_PLACEMENT: {
    productId: "prod_sponsor_article",
    priceId:   "price_sponsor_article",
    name:      "Featured Article Placement",
    price:     9900, // $99
    interval:  "one_time" as const,
  },

  // ── Advertiser ad slots ───────────────────────────────────────────────────
  AD_BILLBOARD_WEEKLY: {
    productId: "prod_ad_billboard",
    priceId:   "price_ad_billboard_weekly",
    name:      "Billboard Ad Slot (1 week)",
    price:     14900, // $149/wk
    interval:  "week" as const,
  },
  AD_BANNER_MONTHLY: {
    productId: "prod_ad_banner",
    priceId:   "price_ad_banner_monthly",
    name:      "Page Banner Ad (1 month)",
    price:     9900, // $99/mo
    interval:  "month" as const,
  },

  // ── Artist upgrades ───────────────────────────────────────────────────────
  ARTIST_SPOTLIGHT: {
    productId: "prod_artist_spotlight",
    priceId:   "price_artist_spotlight",
    name:      "Homepage Artist Spotlight",
    price:     4900, // $49 per feature
    interval:  "one_time" as const,
  },
  ARTIST_BOOST: {
    productId: "prod_artist_boost",
    priceId:   "price_artist_boost",
    name:      "Artist Discovery Boost (7 days)",
    price:     1900, // $19
    interval:  "one_time" as const,
  },

  // ── Bookings ──────────────────────────────────────────────────────────────
  BOOKING_PLATFORM_FEE: {
    productId: "prod_booking_fee",
    priceId:   "price_booking_fee",
    name:      "Booking Platform Fee",
    price:     999,  // $9.99 per booking
    interval:  "one_time" as const,
  },

  // ── Meet & Greet / Shoutouts ──────────────────────────────────────────────
  MEET_GREET: {
    productId: "prod_meet_greet",
    priceId:   "price_meet_greet",
    name:      "Artist Meet & Greet",
    price:     2500, // $25
    interval:  "one_time" as const,
  },
  SHOUTOUT: {
    productId: "prod_shoutout",
    priceId:   "price_shoutout",
    name:      "Personalized Artist Shoutout",
    price:     1500, // $15
    interval:  "one_time" as const,
  },

  // ── Fan Club ──────────────────────────────────────────────────────────────
  FAN_CLUB_BRONZE:   { productId:"prod_fan_club", priceId:"price_fan_club_bronze",  name:"Fan Club Bronze",  price: 299,  interval:"month" as const },
  FAN_CLUB_SILVER:   { productId:"prod_fan_club", priceId:"price_fan_club_silver",  name:"Fan Club Silver",  price: 499,  interval:"month" as const },
  FAN_CLUB_GOLD:     { productId:"prod_fan_club", priceId:"price_fan_club_gold",    name:"Fan Club Gold",    price: 999,  interval:"month" as const },
  FAN_CLUB_PLATINUM: { productId:"prod_fan_club", priceId:"price_fan_club_platinum",name:"Fan Club Platinum",price: 1999, interval:"month" as const },

  // ── Tickets ───────────────────────────────────────────────────────────────
  TICKET_STANDARD: { productId:"prod_ticket", priceId:"price_ticket_standard", name:"Event Ticket (Standard)", price:500,  interval:"one_time" as const },
  TICKET_VIP:      { productId:"prod_ticket", priceId:"price_ticket_vip",      name:"Event Ticket (VIP)",      price:1500, interval:"one_time" as const },

  // ── NFT / Beat ────────────────────────────────────────────────────────────
  BEAT_LICENSE: { productId:"prod_beat", priceId:"price_beat_license", name:"Beat License", price:2500, interval:"one_time" as const },
  NFT_MINT_FEE: { productId:"prod_nft",  priceId:"price_nft_mint_fee", name:"NFT Mint Fee", price:999,  interval:"one_time" as const },
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
} as const;

export type StripeProductKey = keyof typeof STRIPE_PRODUCTS;

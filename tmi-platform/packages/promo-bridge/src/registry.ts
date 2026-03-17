import type { ProductKey, PromoCreative } from "@tmi/contracts";

export type PromoProduct = {
  key: ProductKey;
  title: string;
  defaultPriority: number;
  creatives: PromoCreative[];
};

export const PROMO_REGISTRY: PromoProduct[] = [
  {
    key: "danikaslaw",
    title: "Danica’s Law — Law Bubble",
    defaultPriority: 90,
    creatives: [
      {
        headline: "Know your rights — fast.",
        subhead: "Tap the Law Bubble for quick legal info.",
        cta: "Open Law Bubble",
        href: "/danikaslaw",
        badge: "Legal",
      },
    ],
  },
  {
    key: "willdoit",
    title: "WillDoIt",
    defaultPriority: 60,
    creatives: [
      {
        headline: "Need it done today?",
        subhead: "Book local help in minutes.",
        cta: "Find a helper",
        href: "/willdoit",
      },
    ],
  },
  {
    key: "hotscreens",
    title: "HotScreens",
    defaultPriority: 55,
    creatives: [
      {
        headline: "Rent a screen room.",
        subhead: "Shoot, stream, edit — hourly.",
        cta: "Reserve now",
        href: "/hotscreens",
      },
    ],
  },
  {
    key: "rentacharge",
    title: "Rent-A-Charge",
    defaultPriority: 65,
    creatives: [
      {
        headline: "Charging stations that pay.",
        subhead: "Kiosks, events, venues.",
        cta: "See kiosks",
        href: "/rentacharge",
      },
    ],
  },
  {
    key: "thunderworld",
    title: "Thunder World",
    defaultPriority: 70,
    creatives: [
      {
        headline: "Enter Thunder World.",
        subhead: "Stone UI. Neon power.",
        cta: "Launch",
        href: "/thunderworld",
        badge: "Game",
      },
    ],
  },
  {
    key: "tmi",
    title: "The Musician’s Index",
    defaultPriority: 50,
    creatives: [
      {
        headline: "Level up your music career.",
        subhead: "Profiles, battles, bookings, dashboards.",
        cta: "Explore TMI",
        href: "/",
      },
    ],
  },
];

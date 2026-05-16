import { SEO_BRAND } from "./SeoBrandConfig";

export interface FAQEntry {
  question: string;
  answer: string;
}

export interface EventStructuredData {
  name: string;
  startDate: string;
  endDate?: string;
  location: string;
  description: string;
  url: string;
  organizer: string;
  offers?: { price: string; currency: string; availability: string };
}

export interface ArtistStructuredData {
  name: string;
  genre: string;
  url: string;
  image?: string;
  description?: string;
  sameAs?: string[];
}

export interface MusicStructuredData {
  trackName: string;
  byArtist: string;
  inAlbum?: string;
  url: string;
  genre: string;
}

const PLATFORM_FAQS: FAQEntry[] = [
  {
    question: "What is The Musician's Index?",
    answer: "The Musician's Index (TMI) is a live music platform by BernoutGlobal where independent artists battle, perform, compete in cyphers, and connect with fans and venues — all in one place.",
  },
  {
    question: "Who is performing tonight?",
    answer: "Live events on TMI update in real time. Visit themusiciansindex.com/events/live to see who is performing and which rooms are live right now.",
  },
  {
    question: "What rap battles are live?",
    answer: "TMI runs live rap battles and cyphers weekly. Visit themusiciansindex.com/battles/today for today's active battles and themusiciansindex.com/cypher/stage for open cyphers.",
  },
  {
    question: "What's happening in music tonight?",
    answer: "Check TMI's live event wall at themusiciansindex.com/events/live for real-time music events, battles, cyphers, and live performances from independent artists across the US and globally.",
  },
  {
    question: "How do I find independent artists near me?",
    answer: "Browse artist profiles by city on TMI. Each city page shows active local artists, their genre, and upcoming events. Visit themusiciansindex.com/cities to find music near you.",
  },
  {
    question: "What music venues are near me?",
    answer: "TMI's venue directory lists music venues with open mic nights, battles, and live events. Find venues at themusiciansindex.com/venues.",
  },
  {
    question: "How do I enter a music battle?",
    answer: "Artists can join live battles at themusiciansindex.com/battles/create. Weekly cyphers are open to all genres — registration is free for independent artists.",
  },
  {
    question: "What is the top artist this week?",
    answer: "TMI's weekly rankings show the top performers by battle wins, fan votes, and stream activity. See this week's leader at themusiciansindex.com/winners/this-week.",
  },
];

export function generatePlatformFAQSchema(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": PLATFORM_FAQS.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  });
}

export function generateEventSchema(event: EventStructuredData): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    "name": event.name,
    "startDate": event.startDate,
    ...(event.endDate ? { endDate: event.endDate } : {}),
    "location": {
      "@type": "Place",
      "name": event.location,
      "address": event.location,
    },
    "description": event.description,
    "url": event.url,
    "organizer": {
      "@type": "Organization",
      "name": event.organizer,
      "url": SEO_BRAND.ROOT_CANONICAL,
    },
    ...(event.offers ? {
      "offers": {
        "@type": "Offer",
        "price": event.offers.price,
        "priceCurrency": event.offers.currency,
        "availability": `https://schema.org/${event.offers.availability}`,
        "url": event.url,
      },
    } : {}),
  });
}

export function generateArtistSchema(artist: ArtistStructuredData): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "name": artist.name,
    "genre": artist.genre,
    "url": artist.url,
    ...(artist.image ? { "image": artist.image } : {}),
    ...(artist.description ? { "description": artist.description } : {}),
    "member": { "@type": "Person", "name": artist.name },
    "sameAs": artist.sameAs ?? [],
  });
}

export function generateMusicRecordingSchema(track: MusicStructuredData): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    "name": track.trackName,
    "byArtist": { "@type": "MusicGroup", "name": track.byArtist },
    ...(track.inAlbum ? { "inAlbum": { "@type": "MusicAlbum", "name": track.inAlbum } } : {}),
    "url": track.url,
    "genre": track.genre,
  });
}

export function generateBreadcrumbSchema(crumbs: Array<{ name: string; url: string }>): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": crumb.name,
      "item": crumb.url,
    })),
  });
}

export function generateTrendingListSchema(items: Array<{ name: string; url: string; position: number }>): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": items.map(item => ({
      "@type": "ListItem",
      "position": item.position,
      "name": item.name,
      "url": item.url,
    })),
  });
}

export function getPlatformFAQs(): FAQEntry[] {
  return PLATFORM_FAQS;
}

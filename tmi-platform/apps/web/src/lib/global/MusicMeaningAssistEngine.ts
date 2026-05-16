export interface MusicMeaningCard {
  term: string;
  category: "slang" | "genre-term" | "cultural-reference" | "dance" | "instrument" | "phrase";
  origin: string;
  countryCode: string;
  meaning: string;
  culturalContext: string;
  doNotMistakeFor?: string;
}

const MEANING_DB: MusicMeaningCard[] = [
  { term: "Riddim",      category: "genre-term",         origin: "Jamaica",      countryCode: "JM", meaning: "Jamaican word for 'rhythm' — refers to an instrumental track shared by many artists", culturalContext: "The riddim system is unique to dancehall: one beat, 50 artists. This communal approach to production has no equivalent in Western pop." },
  { term: "Wagwan",      category: "phrase",              origin: "Jamaica",      countryCode: "JM", meaning: "What's going on? / What's up? Abbreviated to 'wah gwaan'", culturalContext: "Everyday Patois greeting. Not performative — it's natural speech in Jamaica." },
  { term: "Shalaye",     category: "cultural-reference",  origin: "Nigeria",      countryCode: "NG", meaning: "A Yoruba exclamation of excitement or emphasis, like 'real talk' or 'no cap'", culturalContext: "Used widely in Nigerian music and conversation as an intensifier of truth or energy." },
  { term: "Shaku Shaku", category: "dance",               origin: "Nigeria",      countryCode: "NG", meaning: "A popular Nigerian street dance from Lagos, featuring bent knees and arm movements", culturalContext: "Born in Agege, Lagos in 2017. The dance became Nigeria's most viral cultural export of its year." },
  { term: "Roadman",     category: "slang",               origin: "United Kingdom",countryCode: "GB", meaning: "Someone from the streets — a person who lives by street code. Not always criminal, often just cultural identity.", culturalContext: "UK grime slang that crossed into mainstream UK speech. Being a roadman is about loyalty, street credibility, and a specific aesthetic." },
  { term: "Peng",        category: "slang",               origin: "United Kingdom",countryCode: "GB", meaning: "Something/someone excellent, attractive, or of high quality. 'That track is peng.'", culturalContext: "Originally UK slang from London's multicultural youth culture, now mainstream British English." },
  { term: "Amapiano",    category: "genre-term",          origin: "South Africa", countryCode: "ZA", meaning: "Literally 'the pianos' in Zulu/Sotho — a house music subgenre built around log drum bass, piano chords, and jazz flutes", culturalContext: "Started in Pretoria townships around 2012–2014. By 2020 it was South Africa's dominant export genre. 'Yano' is the slang shortening." },
  { term: "Soca",        category: "genre-term",          origin: "Trinidad",     countryCode: "TT", meaning: "'Soul of Calypso' — upbeat Caribbean music designed for carnival dancing", culturalContext: "Created by Lord Shorty in 1970s Trinidad as calypso evolved into a more danceable, party-oriented form. Carnival is its natural habitat." },
  { term: "Banlieue",    category: "cultural-reference",  origin: "France",       countryCode: "FR", meaning: "French suburb — but specifically refers to the working-class, immigrant-heavy suburbs where French rap was born", culturalContext: "French rap emerged from banlieues like Seine-Saint-Denis outside Paris. The banlieue is to French rap what Compton is to West Coast rap." },
  { term: "Dembow",      category: "genre-term",          origin: "Puerto Rico",  countryCode: "PR", meaning: "The rhythmic pattern that defines reggaeton — a syncopated drum pattern derived from Jamaican dancehall", culturalContext: "Named after Shabba Ranks' 1990 song 'Dem Bow'. The pattern traveled from Jamaica to Panama to Puerto Rico and became the backbone of global Latin music." },
];

export function getMusicMeaningCard(term: string): MusicMeaningCard | null {
  const t = term.toLowerCase().trim();
  return MEANING_DB.find(m => m.term.toLowerCase() === t) ?? null;
}

export function searchMusicMeaning(query: string): MusicMeaningCard[] {
  const q = query.toLowerCase();
  return MEANING_DB.filter(m =>
    m.term.toLowerCase().includes(q) ||
    m.meaning.toLowerCase().includes(q) ||
    m.origin.toLowerCase().includes(q)
  );
}

export function getMeaningsByCountry(countryCode: string): MusicMeaningCard[] {
  return MEANING_DB.filter(m => m.countryCode === countryCode.toUpperCase());
}

export function getMeaningsByCategory(category: MusicMeaningCard["category"]): MusicMeaningCard[] {
  return MEANING_DB.filter(m => m.category === category);
}

export function getAllMusicMeanings(): MusicMeaningCard[] {
  return MEANING_DB;
}

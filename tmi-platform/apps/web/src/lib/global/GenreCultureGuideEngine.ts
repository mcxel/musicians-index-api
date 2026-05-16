import { getGenreById, type GlobalGenre } from "./GlobalGenreEngine";

export interface GenreCultureGuide {
  genreId: string;
  genre: GlobalGenre;
  originStory: string;
  socialContext: string;
  rhythmNote: string;
  instrumentNote: string;
  danceNote: string;
  languageNote: string;
  exportHistory: string;
  listenFirst: string[];
  doNotConfuseWith: string[];
}

const GUIDES: Record<string, Omit<GenreCultureGuide, "genreId" | "genre">> = {
  "afrobeats": {
    originStory: "Emerged from Lagos nightclub culture in the 2000s fusing highlife, hip-hop, and Afro-soul. Artists like D'banj and 2Face Idibia laid the commercial foundation before Wizkid, Burna Boy, and Davido took it global.",
    socialContext: "Music of celebration, community, and pan-African pride. Often played at Nigerian events, weddings, and street parties. Connects diaspora communities across the globe.",
    rhythmNote: "Syncopated 4/4 groove with layered percussion. The hi-hat and kick drum tell the story — often with a triplet feel that makes it irresistibly danceable.",
    instrumentNote: "Talking drum, shekere, electric guitar, synthesizer, bass guitar, and layered vocal harmonies. Modern productions use 808s and trap hi-hats over traditional grooves.",
    danceNote: "Afrobeats spawned dances like Shaku Shaku, Skelewu, and Zanku. The body moves from the waist — fluid, rhythmic, and celebratory.",
    languageNote: "Mostly English with Yoruba, Igbo, and Pidgin mixed in. Lyrical themes cover love, hustle, God, African identity, and street life.",
    exportHistory: "By 2020, Afrobeats was the fastest-growing global genre by streaming numbers. Artists collaborate with Drake, Beyoncé, and Ed Sheeran. Nigerian music now charts globally without needing Western co-signs.",
    listenFirst: ["Wizkid - Essence", "Burna Boy - Last Last", "Davido - Assurance", "Tems - Free Mind"],
    doNotConfuseWith: ["Afrobeat (Fela Kuti's political jazz-funk) is different from modern Afrobeats — though they share ancestry."],
  },
  "dancehall": {
    originStory: "Born in Kingston, Jamaica in the late 1970s as reggae evolved. Sound system culture — mobile DJ setups playing in yards and streets — is the original vehicle. Prince Jammy's computerized riddims in 1985 changed everything.",
    socialContext: "Street music of the Jamaican working class. Dancehall is raw, confrontational, and joyful simultaneously. It speaks to economic hardship, sexuality, spirituality, and community.",
    rhythmNote: "Faster than reggae — typically 75–95 BPM with the signature 'one-drop' rhythm: kick and snare hit on beat 3 instead of beat 2. Digital riddims dominate since the late 1980s.",
    instrumentNote: "Riddim tracks are produced digitally — bass, digital drum programming, synthesizers. Artists toast (rap) or sing melodically over shared riddims.",
    danceNote: "Dance is as important as music. Dances like 'World Dance,' 'Dutty Wine,' 'Bruk Back,' and 'Daggering' each defined an era. Dances travel to diaspora communities before official releases.",
    languageNote: "Jamaican Patois is the primary language — a Creole blend of West African, English, Spanish, and Arawak. Patois is not 'broken English' — it's a full language with grammar and structure.",
    exportHistory: "Dancehall influenced hip-hop, UK garage, grime, and afrobeats. Artists like Sean Paul, Shaggy, and Popcaan crossed to global charts. The riddim system model influenced trap music.",
    listenFirst: ["Vybz Kartel - Fever", "Popcaan - Unruly", "Skillibeng - Whap Whap", "Spice - Sheet"],
    doNotConfuseWith: ["Reggae is the parent genre — slower, more political, and spiritual. Dancehall is the urban, faster child."],
  },
};

export function getGenreCultureGuide(genreId: string): GenreCultureGuide | null {
  const genre = getGenreById(genreId);
  if (!genre) return null;
  const guide = GUIDES[genreId];
  if (!guide) return null;
  return { genreId, genre, ...guide };
}

export function getAvailableGuideIds(): string[] {
  return Object.keys(GUIDES);
}

export function hasGuide(genreId: string): boolean {
  return genreId in GUIDES;
}

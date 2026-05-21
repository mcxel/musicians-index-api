// apps/web/src/lib/genre/genre.registry.ts
// Genre system that powers discovery, battles, rankings, and sponsorship targeting.

export type GenreId =
  | "hip_hop" | "rnb" | "pop" | "rock" | "electronic" | "jazz"
  | "soul" | "gospel" | "country" | "latin" | "reggae" | "blues"
  | "classical" | "folk" | "alternative" | "punk" | "metal"
  | "funk" | "disco" | "afrobeat" | "dancehall" | "trap"
  | "house" | "techno" | "drum_bass" | "lo_fi" | "indie"
  | "spoken_word" | "comedy" | "dance_performance" | "mixed";

export interface Genre {
  id: GenreId;
  label: string;
  color: string;           // neon accent color
  emoji: string;
  audioProfile: string;    // default audio preset for this genre
  battleRoles: string[];   // which battle roles are associated
  parentGenre?: GenreId;   // sub-genres link to parent
  description: string;
  isSearchable: boolean;
  isBillboardEnabled: boolean;
}

export const GENRE_REGISTRY: Record<GenreId, Genre> = {
  hip_hop:         { id:"hip_hop",         label:"Hip-Hop",          color:"#FF2D78", emoji:"🎤", audioProfile:"rap_spoken",  battleRoles:["rapper","cypher_rapper","beatmaker","producer","dj"],   description:"Rap, beats, lyricism, and culture",             isSearchable:true, isBillboardEnabled:true },
  rnb:             { id:"rnb",             label:"R&B",              color:"#7B2FBE", emoji:"🎵", audioProfile:"singing_warm", battleRoles:["vocalist","singer","songwriter"],                       description:"Rhythm and Blues — smooth and soulful",         isSearchable:true, isBillboardEnabled:true },
  pop:             { id:"pop",             label:"Pop",              color:"#FFB800", emoji:"⭐", audioProfile:"vocal_clean",  battleRoles:["vocalist","singer","solo_artist","duo","band"],         description:"Mainstream pop — catchy and accessible",         isSearchable:true, isBillboardEnabled:true },
  rock:            { id:"rock",            label:"Rock",             color:"#FF8C00", emoji:"🎸", audioProfile:"battle_mode",  battleRoles:["guitarist","drummer","bassist","band"],                 description:"Rock music — electric energy",                   isSearchable:true, isBillboardEnabled:true },
  electronic:      { id:"electronic",      label:"Electronic",       color:"#00E5FF", emoji:"🎧", audioProfile:"concert_music",battleRoles:["dj","producer","beatmaker"],                           description:"Electronic, EDM, synthesizer music",             isSearchable:true, isBillboardEnabled:true },
  jazz:            { id:"jazz",            label:"Jazz",             color:"#00B8A9", emoji:"🎷", audioProfile:"acoustic",     battleRoles:["pianist","saxophonist","bassist","drummer","vocalist"],  description:"Jazz — improvisation and musicianship",          isSearchable:true, isBillboardEnabled:true },
  soul:            { id:"soul",            label:"Soul",             color:"#7B2FBE", emoji:"💜", audioProfile:"singing_warm", battleRoles:["vocalist","singer","pianist","songwriter"],              description:"Soul music — deep feeling and expression",       isSearchable:true, isBillboardEnabled:true },
  gospel:          { id:"gospel",          label:"Gospel",           color:"#FFD700", emoji:"🙏", audioProfile:"vocal_loud",   battleRoles:["vocalist","choir","keyboardist","pianist"],             description:"Gospel — spiritual music and worship",           isSearchable:true, isBillboardEnabled:true },
  country:         { id:"country",         label:"Country",          color:"#FF8C00", emoji:"🤠", audioProfile:"acoustic",     battleRoles:["vocalist","guitarist","songwriter","band"],              description:"Country — storytelling and acoustic roots",      isSearchable:true, isBillboardEnabled:true },
  latin:           { id:"latin",           label:"Latin",            color:"#FF2D78", emoji:"💃", audioProfile:"concert_music",battleRoles:["vocalist","dancer","band","music_group"],               description:"Latin music — reggaeton, salsa, bachata, more",  isSearchable:true, isBillboardEnabled:true },
  reggae:          { id:"reggae",          label:"Reggae",           color:"#00C896", emoji:"🌿", audioProfile:"singing_warm", battleRoles:["vocalist","bassist","drummer","guitarist"],              description:"Reggae — roots, culture, and riddim",            isSearchable:true, isBillboardEnabled:true },
  blues:           { id:"blues",           label:"Blues",            color:"#4A90E2", emoji:"😢", audioProfile:"acoustic",     battleRoles:["vocalist","guitarist","pianist"],                        description:"Blues — raw emotion and storytelling",           isSearchable:true, isBillboardEnabled:true },
  classical:       { id:"classical",       label:"Classical",        color:"#C0C0C0", emoji:"🎻", audioProfile:"acoustic",     battleRoles:["pianist","violinist","trumpeter"],                       description:"Classical and orchestral music",                 isSearchable:true, isBillboardEnabled:false },
  folk:            { id:"folk",            label:"Folk",             color:"#8B4513", emoji:"🪕", audioProfile:"acoustic",     battleRoles:["vocalist","guitarist","songwriter"],                     description:"Folk — acoustic storytelling traditions",        isSearchable:true, isBillboardEnabled:true },
  alternative:     { id:"alternative",     label:"Alternative",      color:"#9B59B6", emoji:"🎸", audioProfile:"battle_mode",  battleRoles:["vocalist","guitarist","drummer","band"],                 description:"Alternative rock and indie",                     isSearchable:true, isBillboardEnabled:true },
  funk:            { id:"funk",            label:"Funk",             color:"#FF8C00", emoji:"🕺", audioProfile:"concert_music",battleRoles:["bassist","drummer","keyboardist","vocalist"],            description:"Funk — groove, bass, and rhythm",                isSearchable:true, isBillboardEnabled:true },
  afrobeat:        { id:"afrobeat",        label:"Afrobeat",         color:"#FFD700", emoji:"🥁", audioProfile:"concert_music",battleRoles:["drummer","percussionist","vocalist","band"],             description:"Afrobeat — West African rhythms and energy",     isSearchable:true, isBillboardEnabled:true },
  trap:            { id:"trap",            label:"Trap",             color:"#FF2D78", emoji:"💎", audioProfile:"rap_spoken",   battleRoles:["rapper","producer","beatmaker"],                         description:"Trap — 808s, hi-hats, and Atlanta sound",        isSearchable:true, isBillboardEnabled:true },
  house:           { id:"house",           label:"House",            color:"#00E5FF", emoji:"🏠", audioProfile:"concert_music",battleRoles:["dj","producer"],                                         description:"House music — four-on-the-floor dance",          isSearchable:true, isBillboardEnabled:true },
  lo_fi:           { id:"lo_fi",           label:"Lo-Fi",            color:"#B8A9C9", emoji:"☁️", audioProfile:"acoustic",     battleRoles:["producer","beatmaker","pianist"],                        description:"Lo-fi — chill, study, ambient beats",            isSearchable:true, isBillboardEnabled:false },
  spoken_word:     { id:"spoken_word",     label:"Spoken Word",      color:"#C0C0C0", emoji:"🗣️", audioProfile:"podcast_host",  battleRoles:["spoken_word","comedian"],                               description:"Spoken word poetry and vocal performance",       isSearchable:true, isBillboardEnabled:true },
  comedy:          { id:"comedy",          label:"Comedy",           color:"#FFD700", emoji:"😂", audioProfile:"podcast_host",  battleRoles:["comedian"],                                             description:"Stand-up and musical comedy performance",        isSearchable:true, isBillboardEnabled:true },
  dance_performance:{id:"dance_performance",label:"Dance",           color:"#FF2D78", emoji:"💃", audioProfile:"concert_music",battleRoles:["dancer","dance_solo","dance_duo","dance_group"],         description:"Dance performance and choreography",             isSearchable:true, isBillboardEnabled:true },
  mixed:           { id:"mixed",           label:"Mixed/Other",      color:"#7B2FBE", emoji:"🎭", audioProfile:"vocal_clean",  battleRoles:["solo_artist","duo","band"],                              description:"Cross-genre and mixed style performances",       isSearchable:true, isBillboardEnabled:false },
  // Additional genres (abbreviated)
  punk:            { id:"punk",            label:"Punk",             color:"#FF2D78", emoji:"🤘", audioProfile:"battle_mode",  battleRoles:["vocalist","guitarist","drummer","band"],  description:"Punk rock energy", isSearchable:true, isBillboardEnabled:true },
  metal:           { id:"metal",           label:"Metal",            color:"#333333", emoji:"🎸", audioProfile:"battle_mode",  battleRoles:["guitarist","drummer","vocalist","band"],  description:"Heavy metal",      isSearchable:true, isBillboardEnabled:true },
  disco:           { id:"disco",           label:"Disco",            color:"#FF69B4", emoji:"🪩", audioProfile:"concert_music",battleRoles:["vocalist","dj","dancer"],                 description:"Disco fever",      isSearchable:true, isBillboardEnabled:false },
  dancehall:       { id:"dancehall",       label:"Dancehall",        color:"#FFD700", emoji:"🔊", audioProfile:"rap_spoken",   battleRoles:["vocalist","dancer"],                     description:"Jamaican dancehall",isSearchable:true, isBillboardEnabled:true },
  techno:          { id:"techno",          label:"Techno",           color:"#00E5FF", emoji:"⚡", audioProfile:"concert_music",battleRoles:["dj","producer"],                         description:"Hard techno",      isSearchable:true, isBillboardEnabled:false },
  drum_bass:       { id:"drum_bass",       label:"Drum & Bass",      color:"#FF8C00", emoji:"🥁", audioProfile:"concert_music",battleRoles:["producer","dj","drummer"],               description:"DnB",              isSearchable:true, isBillboardEnabled:false },
  indie:           { id:"indie",           label:"Indie",            color:"#9B59B6", emoji:"🌿", audioProfile:"acoustic",     battleRoles:["vocalist","guitarist","band"],            description:"Indie alternative", isSearchable:true, isBillboardEnabled:true },
};

export function getGenresByRole(battleRole: string): Genre[] {
  return Object.values(GENRE_REGISTRY).filter(g => g.battleRoles.includes(battleRole));
}

export function getSearchableGenres(): Genre[] {
  return Object.values(GENRE_REGISTRY).filter(g => g.isSearchable);
}

export function getBillboardGenres(): Genre[] {
  return Object.values(GENRE_REGISTRY).filter(g => g.isBillboardEnabled);
}

export const artistImages = [
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200",
  "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=1200",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200",
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200",
];

export const beatImages = [
  "https://images.unsplash.com/photo-1516280030429-27679b3dc9cf?w=1200",
  "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=1200",
  "https://images.unsplash.com/photo-1571974599782-87624638275d?w=1200",
  "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200",
];

export const venueImages = [
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200",
  "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200",
  "https://images.unsplash.com/photo-1501612780327-45045538702b?w=1200",
  "https://images.unsplash.com/photo-1497032205916-ac775f0649ae?w=1200",
];

export const battleImages = [
  "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200",
  "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=1200",
  "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=1200",
];

export const nftImages = [
  "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=1200",
  "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=1200",
  "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=1200",
  "https://images.unsplash.com/photo-1644143379190-08a7b15d6b6a?w=1200",
];

export const sponsorImages = [
  "https://images.unsplash.com/photo-1529336953121-a0ce7f9f6e13?w=1200",
  "https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=1200",
  "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200",
  "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1200",
];

export const articleImages = [
  "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=1200",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200",
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200",
];

export function imageAt(pool: string[], index: number): string {
  if (pool.length === 0) return "";
  return pool[index % pool.length];
}

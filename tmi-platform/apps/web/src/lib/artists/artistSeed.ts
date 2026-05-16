export type ArtistSubscriptionTier =
  | "FREE"
  | "PRO"
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "DIAMOND";

export type ArtistAddOnTier = "NONE" | "LIVE_PLUS" | "PROMO_PLUS" | "LABEL_PLUS";

export type ArtistSeedRecord = {
  id: string;
  name: string;
  genre: "Hip Hop" | "R&B" | "Pop" | "Electronic" | "Rock" | "Afrobeat" | "Local" | "Worldwide" | "Global" | "EDM" | "Jazz" | "Soul";
  image: string;
  tier: ArtistSubscriptionTier;
  addOnTier: ArtistAddOnTier;
};

const TIERS: ArtistSubscriptionTier[] = ["FREE", "PRO", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"];
const ADDONS: ArtistAddOnTier[] = ["NONE", "LIVE_PLUS", "PROMO_PLUS", "LABEL_PLUS"];

const CURATED_IMAGES = [
  "/tmi-curated/mag-20.jpg",
  "/tmi-curated/mag-28.jpg",
  "/tmi-curated/mag-35.jpg",
  "/tmi-curated/mag-42.jpg",
  "/tmi-curated/mag-50.jpg",
  "/tmi-curated/mag-58.jpg",
  "/tmi-curated/mag-66.jpg",
  "/tmi-curated/mag-74.jpg",
  "/tmi-curated/mag-82.jpg",
];

function img(index: number): string {
  return CURATED_IMAGES[index % CURATED_IMAGES.length];
}

function tier(index: number): ArtistSubscriptionTier {
  return TIERS[index % TIERS.length];
}

function addon(index: number): ArtistAddOnTier {
  return ADDONS[index % ADDONS.length];
}

export const ARTIST_SEED: ArtistSeedRecord[] = [
  { id: "lyra-sky", name: "Lyra Sky", genre: "Pop", image: img(0), tier: tier(0), addOnTier: addon(0) },
  { id: "kira-bloom", name: "Kira Bloom", genre: "R&B", image: img(1), tier: tier(1), addOnTier: addon(1) },
  { id: "milo-spark", name: "Milo Spark", genre: "Hip Hop", image: img(2), tier: tier(2), addOnTier: addon(2) },
  { id: "tessa-glint", name: "Tessa Glint", genre: "Electronic", image: img(3), tier: tier(3), addOnTier: addon(3) },
  { id: "neon-vale", name: "Neon Vale", genre: "Pop", image: img(4), tier: tier(4), addOnTier: addon(0) },
  { id: "ari-pulse", name: "Ari Pulse", genre: "EDM", image: img(5), tier: tier(5), addOnTier: addon(1) },
  { id: "kova-star", name: "Kova Star", genre: "Hip Hop", image: img(6), tier: tier(6), addOnTier: addon(2) },
  { id: "rio-lux", name: "Rio Lux", genre: "R&B", image: img(7), tier: tier(0), addOnTier: addon(3) },
  { id: "nyla-prism", name: "Nyla Prism", genre: "Pop", image: img(8), tier: tier(1), addOnTier: addon(0) },
  { id: "echo-tone", name: "Echo Tone", genre: "Electronic", image: img(9), tier: tier(2), addOnTier: addon(1) },

  { id: "jax-onyx", name: "Jax Onyx", genre: "Rock", image: img(10), tier: tier(3), addOnTier: addon(2) },
  { id: "luna-verse", name: "Luna Verse", genre: "Pop", image: img(11), tier: tier(4), addOnTier: addon(3) },
  { id: "drex-volt", name: "Drex Volt", genre: "EDM", image: img(12), tier: tier(5), addOnTier: addon(0) },
  { id: "sora-wave", name: "Sora Wave", genre: "R&B", image: img(13), tier: tier(6), addOnTier: addon(1) },
  { id: "kai-zenith", name: "Kai Zenith", genre: "Hip Hop", image: img(14), tier: tier(0), addOnTier: addon(2) },
  { id: "nova-keys", name: "Nova Keys", genre: "Jazz", image: img(15), tier: tier(1), addOnTier: addon(3) },
  { id: "zuri-flame", name: "Zuri Flame", genre: "Soul", image: img(16), tier: tier(2), addOnTier: addon(0) },
  { id: "atlas-riff", name: "Atlas Riff", genre: "Rock", image: img(17), tier: tier(3), addOnTier: addon(1) },
  { id: "vex-sound", name: "Vex Sound", genre: "Electronic", image: img(18), tier: tier(4), addOnTier: addon(2) },
  { id: "mira-glow", name: "Mira Glow", genre: "Pop", image: img(19), tier: tier(5), addOnTier: addon(3) },

  { id: "zeno-blaze", name: "Zeno Blaze", genre: "Hip Hop", image: img(20), tier: tier(6), addOnTier: addon(0) },
  { id: "ivy-echo", name: "Ivy Echo", genre: "Pop", image: img(21), tier: tier(0), addOnTier: addon(1) },
  { id: "rex-harmony", name: "Rex Harmony", genre: "R&B", image: img(22), tier: tier(1), addOnTier: addon(2) },
  { id: "luxe-aria", name: "Luxe Aria", genre: "Jazz", image: img(23), tier: tier(2), addOnTier: addon(3) },
  { id: "nova-rift", name: "Nova Rift", genre: "Electronic", image: img(24), tier: tier(3), addOnTier: addon(0) },
  { id: "cleo-verse", name: "Cleo Verse", genre: "Pop", image: img(25), tier: tier(4), addOnTier: addon(1) },
  { id: "kai-drift", name: "Kai Drift", genre: "Hip Hop", image: img(26), tier: tier(5), addOnTier: addon(2) },
  { id: "aria-vault", name: "Aria Vault", genre: "R&B", image: img(27), tier: tier(6), addOnTier: addon(3) },
  { id: "onyx-lyric", name: "Onyx Lyric", genre: "Rock", image: img(28), tier: tier(0), addOnTier: addon(0) },
  { id: "sola-tune", name: "Sola Tune", genre: "Pop", image: img(29), tier: tier(1), addOnTier: addon(1) },

  { id: "vibe-kairo", name: "Vibe Kairo", genre: "EDM", image: img(30), tier: tier(2), addOnTier: addon(2) },
  { id: "nix-flare", name: "Nix Flare", genre: "Electronic", image: img(31), tier: tier(3), addOnTier: addon(3) },
  { id: "juno-keys", name: "Juno Keys", genre: "Jazz", image: img(32), tier: tier(4), addOnTier: addon(0) },
  { id: "drax-tone", name: "Drax Tone", genre: "Hip Hop", image: img(33), tier: tier(5), addOnTier: addon(1) },
  { id: "mira-zen", name: "Mira Zen", genre: "R&B", image: img(34), tier: tier(6), addOnTier: addon(2) },
  { id: "axel-volt", name: "Axel Volt", genre: "Electronic", image: img(35), tier: tier(0), addOnTier: addon(3) },
  { id: "lyric-noir", name: "Lyric Noir", genre: "Soul", image: img(36), tier: tier(1), addOnTier: addon(0) },
  { id: "siri-wave", name: "Siri Wave", genre: "Pop", image: img(37), tier: tier(2), addOnTier: addon(1) },
  { id: "kano-sound", name: "Kano Sound", genre: "Hip Hop", image: img(38), tier: tier(3), addOnTier: addon(2) },
  { id: "nova-echo", name: "Nova Echo", genre: "Electronic", image: img(39), tier: tier(4), addOnTier: addon(3) },

  { id: "big-a", name: "Big A", genre: "Hip Hop", image: img(40), tier: tier(5), addOnTier: addon(0) },
  { id: "ray-journey", name: "Ray Journey", genre: "Worldwide", image: img(41), tier: tier(6), addOnTier: addon(1) },
  { id: "velvet-lane", name: "Velvet Lane", genre: "R&B", image: img(42), tier: tier(0), addOnTier: addon(2) },
  { id: "circuit-halo", name: "Circuit Halo", genre: "Global", image: img(43), tier: tier(1), addOnTier: addon(3) },
  { id: "afro-reign", name: "Afro Reign", genre: "Afrobeat", image: img(44), tier: tier(2), addOnTier: addon(0) },
  { id: "city-local", name: "City Local", genre: "Local", image: img(45), tier: tier(3), addOnTier: addon(1) },
  { id: "world-axis", name: "World Axis", genre: "Worldwide", image: img(46), tier: tier(4), addOnTier: addon(2) },
  { id: "globe-core", name: "Globe Core", genre: "Global", image: img(47), tier: tier(5), addOnTier: addon(3) },
  { id: "rock-rider", name: "Rock Rider", genre: "Rock", image: img(48), tier: tier(6), addOnTier: addon(0) },
  { id: "pop-crown", name: "Pop Crown", genre: "Pop", image: img(49), tier: tier(0), addOnTier: addon(1) },

  { id: "hiphop-wave", name: "HipHop Wave", genre: "Hip Hop", image: img(50), tier: tier(1), addOnTier: addon(2) },
  { id: "rnb-glide", name: "RNB Glide", genre: "R&B", image: img(51), tier: tier(2), addOnTier: addon(3) },
  { id: "rock-pulse", name: "Rock Pulse", genre: "Rock", image: img(52), tier: tier(3), addOnTier: addon(0) },
  { id: "pop-shift", name: "Pop Shift", genre: "Pop", image: img(53), tier: tier(4), addOnTier: addon(1) },
  { id: "afro-flare", name: "Afro Flare", genre: "Afrobeat", image: img(54), tier: tier(5), addOnTier: addon(2) },
  { id: "local-circuit", name: "Local Circuit", genre: "Local", image: img(55), tier: tier(6), addOnTier: addon(3) },
  { id: "worldwide-voice", name: "Worldwide Voice", genre: "Worldwide", image: img(56), tier: tier(0), addOnTier: addon(0) },
  { id: "global-signal", name: "Global Signal", genre: "Global", image: img(57), tier: tier(1), addOnTier: addon(1) },
  { id: "electro-grid", name: "Electro Grid", genre: "Electronic", image: img(58), tier: tier(2), addOnTier: addon(2) },
  { id: "soul-lumen", name: "Soul Lumen", genre: "Soul", image: img(59), tier: tier(3), addOnTier: addon(3) },
];

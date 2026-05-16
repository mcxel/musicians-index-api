export interface ProfileInventory {
  trophies: string[];
  badges: string[];
  memories: number;
}

export function getProfileInventory(slug: string): ProfileInventory {
  const base = slug.length;
  return {
    trophies: ["Weekly Spotlight", "Reader Favorite"].slice(0, (base % 2) + 1),
    badges: ["Verified", "Active"],
    memories: 8 + (base % 10),
  };
}

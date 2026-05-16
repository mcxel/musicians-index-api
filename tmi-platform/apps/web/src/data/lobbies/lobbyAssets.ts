export type LobbyAssetEntry = {
  imageId: string;
  sourceAssetPath: string;
  themeKey: string;
  generatedMetadataPath: string;
};

function themeForIndex(index: number): string {
  if (index <= 3) return "vip_lounge";
  if (index <= 6) return "stage_theater";
  if (index <= 9) return "arena_tower";
  return "discovery_lobby";
}

export const lobbyAssets: LobbyAssetEntry[] = Array.from({ length: 11 }, (_, offset) => {
  const index = offset + 1;
  return {
    imageId: `lobbies-${index}`,
    sourceAssetPath: `Tmi PDF's/Lobbies/Lobbies ${index}.jpg`,
    themeKey: themeForIndex(index),
    generatedMetadataPath: `@/data/lobbies/generated/lobbies-${index}.metadata.json`,
  };
});

export type HomepageArtifactKey = "1" | "1-2" | "2" | "3" | "4" | "5" | "games";

export type HomepageArtifactMeta = {
  key: HomepageArtifactKey;
  route: string;
  title: string;
  sourceAsset: string;
  convertedAsset: string;
  componentPath: string;
  magazineMode?: "closed-cover" | "open-spread" | "standard";
};

const homepageArtifacts: Record<HomepageArtifactKey, HomepageArtifactMeta> = {
  "1": {
    key: "1",
    route: "/home/1",
    title: "Home 1",
    sourceAsset: "Tmi Homepage 1.jpg",
    convertedAsset: "_converted_webp_all/Tmi Homepage 1.webp",
    componentPath: "src/artifacts/homepages/HomePage01.artifact.tsx",
    magazineMode: "closed-cover",
  },
  "1-2": {
    key: "1-2",
    route: "/home/1-2",
    title: "Home 1-2",
    sourceAsset: "Tmi Homepage 1-2.jpg",
    convertedAsset: "_converted_webp_all/Tmi Homepage 1-2.webp",
    componentPath: "src/artifacts/homepages/HomePage012.artifact.tsx",
    magazineMode: "open-spread",
  },
  "2": {
    key: "2",
    route: "/home/2",
    title: "Home 2",
    sourceAsset: "Tmi Homepage 2.png",
    convertedAsset: "_converted_webp_all/Tmi Homepage 2.webp",
    componentPath: "src/artifacts/homepages/HomePage02.artifact.tsx",
  },
  "3": {
    key: "3",
    route: "/home/3",
    title: "Home 3",
    sourceAsset: "Tmi Homepage 3.png",
    convertedAsset: "_converted_webp_all/Tmi Homepage 3.webp",
    componentPath: "src/artifacts/homepages/HomePage03.artifact.tsx",
  },
  "4": {
    key: "4",
    route: "/home/4",
    title: "Home 4",
    sourceAsset: "Tmi Homepage 4.png",
    convertedAsset: "_converted_webp_all/Tmi Homepage 4.webp",
    componentPath: "src/artifacts/homepages/HomePage04.artifact.tsx",
  },
  "5": {
    key: "5",
    route: "/home/5",
    title: "Home 5",
    sourceAsset: "Tmi Homepage 5.png",
    convertedAsset: "_converted_webp_all/Tmi Homepage 5.webp",
    componentPath: "src/artifacts/homepages/HomePage05.artifact.tsx",
  },
  "games": {
    key: "games",
    route: "/home/games",
    title: "Games Hub",
    sourceAsset: "Tmi Homepage Games.png",
    convertedAsset: "_converted_webp_all/Tmi Homepage Games.webp",
    componentPath: "src/artifacts/homepages/HomePageGames.artifact.tsx",
    magazineMode: "standard",
  },
};

export function listHomepageArtifacts(): HomepageArtifactMeta[] {
  return Object.values(homepageArtifacts);
}

export function getHomepageArtifactMeta(key: HomepageArtifactKey): HomepageArtifactMeta {
  return homepageArtifacts[key];
}

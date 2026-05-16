// MagazineComicStripEngine
// Animated comic panels — music satire, artist stories, sponsor comic ads.

export type ComicPanelType = "scene" | "dialogue" | "caption" | "splash" | "sponsor-ad";

export interface ComicPanel {
  id: string;
  type: ComicPanelType;
  imageUrl?: string;
  backgroundColor: string;
  dialogue?: string;
  speaker?: string;
  caption?: string;
  animated: boolean;
  order: number;
}

export interface ComicStrip {
  id: string;
  title: string;
  episode: number;
  panels: ComicPanel[];
  genre: "satire" | "story" | "editorial" | "sponsor";
  accentColor: string;
  artistId?: string;
  sponsorId?: string;
  animated: boolean;
  shareUrl: string;
}

export function createComicStrip(
  id: string,
  title: string,
  episode: number,
  panels: ComicPanel[],
  options: Partial<ComicStrip> = {},
): ComicStrip {
  return {
    id,
    title,
    episode,
    panels: panels.sort((a, b) => a.order - b.order),
    genre: "story",
    accentColor: "#FF2DAA",
    animated: true,
    shareUrl: `/magazine/comic/${id}`,
    ...options,
  };
}

export function isSponsorComic(strip: ComicStrip): boolean {
  return strip.genre === "sponsor" && !!strip.sponsorId;
}

export function getAnimatedPanels(strip: ComicStrip): ComicPanel[] {
  return strip.panels.filter(p => p.animated);
}

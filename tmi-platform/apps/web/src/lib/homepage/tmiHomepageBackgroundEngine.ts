export type TmiHomepageBackgroundState = {
  id: string;
  gradient: string;
  hazeOpacity: number;
  grainOpacity: number;
};

const BACKGROUNDS: TmiHomepageBackgroundState[] = [
  { id: "bg-neon-noir", gradient: "linear-gradient(145deg, #100423 0%, #182a5f 45%, #611d6b 100%)", hazeOpacity: 0.22, grainOpacity: 0.1 },
  { id: "bg-magenta-cyan", gradient: "linear-gradient(145deg, #220822 0%, #0d4f75 50%, #8c2764 100%)", hazeOpacity: 0.24, grainOpacity: 0.12 },
  { id: "bg-violet-amber", gradient: "linear-gradient(145deg, #200f36 0%, #213b63 50%, #8a4a2b 100%)", hazeOpacity: 0.2, grainOpacity: 0.1 },
];

export function getHomepageBackground(index: number): TmiHomepageBackgroundState {
  return BACKGROUNDS[((index % BACKGROUNDS.length) + BACKGROUNDS.length) % BACKGROUNDS.length];
}

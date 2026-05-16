import { ARTIST_SEED } from "./artistSeed";

export type SampleArtistAccount = {
  id: string;
  displayName: string;
  genre: string;
  profileImage: string;
  articleRoute: string;
  liveRoute: string;
  bookingRoute: string;
  verified: boolean;
};

export const SAMPLE_ARTIST_ACCOUNTS: SampleArtistAccount[] = ARTIST_SEED.slice(0, 20).map((artist, index) => ({
  id: artist.id,
  displayName: artist.name,
  genre: artist.genre,
  profileImage: artist.image,
  articleRoute: `/artist/${artist.id}/article`,
  liveRoute: `/live/room/${artist.id}`,
  bookingRoute: `/booking/${artist.id}`,
  verified: index < 5,
}));

export function getArtistFaceByIndex(index: number): string {
  return SAMPLE_ARTIST_ACCOUNTS[index % SAMPLE_ARTIST_ACCOUNTS.length].profileImage;
}
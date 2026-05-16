export type Role = "fan" | "artist" | "venue" | "sponsor" | "advertiser" | "admin"
  | "USER" | "ADMIN" | "STAFF" | "ARTIST";

export interface UserPublic {
  id: string;
  email: string;
  name?: string;
  displayName?: string;
  role: Role;
  createdAt: string;
  avatarUrl?: string;
  emailVerified?: string | null;
}

export interface ArtistPublic {
  id: string;
  userId: string;
  slug: string;
  name: string;
  genre: string;
  bio?: string;
  verified: boolean;
}

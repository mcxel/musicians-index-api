export class ProfileEntity {
  id: string;
  userId: string;
  displayName?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  socialLinks?: any;
  createdAt: Date;
  updatedAt: Date;
}

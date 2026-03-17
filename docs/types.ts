export type UserRole = 'USER' | 'ARTIST' | 'STAFF' | 'ADMIN' | 'JUDGE' | 'SPONSOR';

export interface UserSession {
  userId: string;
  username: string;
  roles: UserRole[];
}

export interface PlatformKernelState {
  session: UserSession | null;
}
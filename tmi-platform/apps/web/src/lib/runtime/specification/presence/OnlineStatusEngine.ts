export interface OnlineStatus {
  userId: string;
  online: boolean;
  lastSeenAtMs: number;
}

export interface OnlineStatusEngine {
  getOnlineStatus(userId: string): Promise<OnlineStatus>;
}

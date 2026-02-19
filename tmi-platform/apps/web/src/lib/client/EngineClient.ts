// apps/web/src/lib/client/EngineClient.ts

type Unsubscribe = () => void;

export class EngineClient {
  constructor(config?: { url?: string }) {
    // Stub constructor that accepts optional config
  }

  onAvatarUpdate?(cb: (avatars: any[]) => void): Unsubscribe;
  onSeatUpdate?(cb: (seats: any[]) => void): Unsubscribe;

  async connect(): Promise<void> {}
  async disconnect(): Promise<void> {}
  async joinRoom(roomId: string, username: string): Promise<void> {}
  async joinAsAvatar(avatarAssetId: string): Promise<void> {}
  async requestSeat(preferredTier: string): Promise<void> {}
}


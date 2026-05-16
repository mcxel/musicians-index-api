// apps/web/src/lib/client/EngineClient.ts

type Unsubscribe = () => void;

export class EngineClient {
  constructor(_config?: { url?: string }) {
    // Stub constructor that accepts optional config
  }

  onAvatarUpdate?(_cb: (avatars: unknown[]) => void): Unsubscribe;
  onSeatUpdate?(_cb: (seats: unknown[]) => void): Unsubscribe;

  async connect(): Promise<void> {}
  async disconnect(): Promise<void> {}
  async joinRoom(_roomId: string, _username: string): Promise<void> {}
  async joinAsAvatar(_avatarAssetId: string): Promise<void> {}
  async requestSeat(_preferredTier: string): Promise<void> {}
}


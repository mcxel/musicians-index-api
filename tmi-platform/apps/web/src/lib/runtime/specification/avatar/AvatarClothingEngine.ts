export interface AvatarClothingEngine {
  applyClothing(avatarId: string, clothingId: string): Promise<void>;
  removeClothing(avatarId: string, clothingId: string): Promise<void>;
}

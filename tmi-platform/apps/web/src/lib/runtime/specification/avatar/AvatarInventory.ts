export interface AvatarInventory {
  listInventory(userId: string): Promise<string[]>;
  equipItem(userId: string, itemId: string): Promise<void>;
}

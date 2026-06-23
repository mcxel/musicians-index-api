export interface AvatarState {
  avatarId: string;
  userId: string;
  clothingIds: string[];
  propIds: string[];
  expression: string;
  animation: string;
}

export interface AvatarRenderer {
  render(state: AvatarState): Promise<void>;
}

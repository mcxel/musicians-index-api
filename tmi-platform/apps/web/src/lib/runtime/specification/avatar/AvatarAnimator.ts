export interface AvatarAnimator {
  playAnimation(avatarId: string, animationId: string): Promise<void>;
}

export interface AvatarExpressionEngine {
  setExpression(avatarId: string, expressionId: string): Promise<void>;
}

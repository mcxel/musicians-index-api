// Expression Engine - Minimal Engine
import type { Expression, ExpressionPack } from './types';

export class ExpressionEngine {
  private packs = new Map<string, ExpressionPack>();
  private current = new Map<string, Expression>();

  registerPack(pack: ExpressionPack): void {
    this.packs.set(pack.id, pack);
  }

  setExpression(avatarId: string, expression: Expression): void {
    this.current.set(avatarId, expression);
  }

  getExpression(avatarId: string): Expression | undefined {
    return this.current.get(avatarId);
  }

  reset(avatarId: string): void {
    this.current.delete(avatarId);
  }
}

export default ExpressionEngine;

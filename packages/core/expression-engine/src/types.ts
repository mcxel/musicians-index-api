// Expression Engine - Minimal Types
export interface Expression { id: string; name: string; intensity?: number; }
export interface ExpressionPack { id: string; expressions: Expression[]; }

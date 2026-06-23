export interface CypherEngine {
  startCypher(roomId: string): Promise<void>;
  submitCypherVote(roomId: string, voterId: string, targetId: string): Promise<void>;
}

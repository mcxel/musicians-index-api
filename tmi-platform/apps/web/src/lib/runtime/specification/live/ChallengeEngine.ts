export interface ChallengeEngine {
  startChallenge(roomId: string): Promise<void>;
  resolveChallenge(roomId: string): Promise<void>;
}

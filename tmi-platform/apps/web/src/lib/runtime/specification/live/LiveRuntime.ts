import type { RoomEngine } from "./RoomEngine";
import type { BattleEngine } from "./BattleEngine";
import type { CypherEngine } from "./CypherEngine";
import type { ChallengeEngine } from "./ChallengeEngine";
import type { AudienceEngine } from "./AudienceEngine";

export interface LiveRuntime {
  rooms: RoomEngine;
  battles: BattleEngine;
  cyphers: CypherEngine;
  challenges: ChallengeEngine;
  audience: AudienceEngine;
}

// apps/web/src/engines/games/gameRegistry.ts
// All game types, rules, and configurations.

export type GameType =
  | "DIRTY_DOZENS"       // 3 rounds × 2min, audience votes
  | "DEAL_OR_FEUD_1000"  // 5 rounds × 60s, objective scoring
  | "NAME_THAT_TUNE"     // identify tracks, speed scoring
  | "LYRIC_BLACKOUT"     // fill in missing lyrics
  | "BEAT_OR_DISS"       // audience votes on beat
  | "GENRE_GUESS"        // guess the genre from a clip
  | "ARTIST_TRIVIA"      // trivia about artists
  | "TMI_JEOPARDY"       // platform-specific trivia
  | "CYPHER_BATTLE"      // 1v1 rap battle with voting
  | "AUDIENCE_CHALLENGE"; // audience-voted mini-challenges

export interface GameConfig {
  type: GameType;
  name: string;
  description: string;
  roundCount: number;
  roundDurationSeconds: number;
  scoringMode: "AUDIENCE_VOTE" | "OBJECTIVE_SCORE" | "SPEED" | "HYBRID";
  maxPlayers: number;
  minPlayers: number;
  hostRequired: boolean;
  hasSponsors: boolean;
  pointsForParticipation: number;
  pointsForWin: number;
  hasPrize: boolean;
  scene: string;
  audioProfile: string;
  ctaMessages: string[];
}

export const GAME_REGISTRY: Record<GameType, GameConfig> = {
  DIRTY_DOZENS: {
    type:"DIRTY_DOZENS", name:"Dirty Dozens", description:"The ultimate MC battle — 3 rounds of bars, audience decides",
    roundCount:3, roundDurationSeconds:120, scoringMode:"AUDIENCE_VOTE", maxPlayers:2, minPlayers:2, hostRequired:true,
    hasSponsors:true, pointsForParticipation:20, pointsForWin:150, hasPrize:true,
    scene:"underground-cypher", audioProfile:"cypher_beat",
    ctaMessages:["Vote for your MC","The crowd decides","Step in the arena"],
  },
  DEAL_OR_FEUD_1000: {
    type:"DEAL_OR_FEUD_1000", name:"Deal or Feud 1000", description:"Survey says — music knowledge meets crowd wisdom",
    roundCount:5, roundDurationSeconds:60, scoringMode:"HYBRID", maxPlayers:8, minPlayers:2, hostRequired:true,
    hasSponsors:true, pointsForParticipation:20, pointsForWin:150, hasPrize:true,
    scene:"game-night", audioProfile:"game_show",
    ctaMessages:["Survey says...","Do you know music?","Join the game NOW"],
  },
  NAME_THAT_TUNE: {
    type:"NAME_THAT_TUNE", name:"Name That Tune", description:"First to name the track wins the round",
    roundCount:10, roundDurationSeconds:15, scoringMode:"SPEED", maxPlayers:20, minPlayers:2, hostRequired:false,
    hasSponsors:false, pointsForParticipation:10, pointsForWin:100, hasPrize:false,
    scene:"game-night", audioProfile:"game_show",
    ctaMessages:["Do you know this track?","Fastest finger wins","Name that tune!"],
  },
  LYRIC_BLACKOUT: {
    type:"LYRIC_BLACKOUT", name:"Lyric Blackout", description:"Fill in the missing lyrics — do you know your music?",
    roundCount:8, roundDurationSeconds:20, scoringMode:"SPEED", maxPlayers:50, minPlayers:1, hostRequired:false,
    hasSponsors:false, pointsForParticipation:5, pointsForWin:80, hasPrize:false,
    scene:"game-night", audioProfile:"game_show",
    ctaMessages:["Finish the lyric","How well do you know the words?"],
  },
  BEAT_OR_DISS: {
    type:"BEAT_OR_DISS", name:"Beat or Diss", description:"Audience votes: banger or skip?",
    roundCount:6, roundDurationSeconds:30, scoringMode:"AUDIENCE_VOTE", maxPlayers:100, minPlayers:2, hostRequired:false,
    hasSponsors:true, pointsForParticipation:5, pointsForWin:50, hasPrize:false,
    scene:"underground-cypher", audioProfile:"cypher_beat",
    ctaMessages:["Beat or Diss? You decide","Is this a banger?"],
  },
  GENRE_GUESS: {
    type:"GENRE_GUESS", name:"Genre Guess", description:"Identify the genre from a 5-second clip",
    roundCount:10, roundDurationSeconds:10, scoringMode:"SPEED", maxPlayers:100, minPlayers:1, hostRequired:false,
    hasSponsors:false, pointsForParticipation:5, pointsForWin:60, hasPrize:false,
    scene:"game-night", audioProfile:"game_show",
    ctaMessages:["Can you name that genre?","Test your music ear"],
  },
  ARTIST_TRIVIA: {
    type:"ARTIST_TRIVIA", name:"Artist Trivia", description:"How well do you know your favorite artists?",
    roundCount:10, roundDurationSeconds:15, scoringMode:"SPEED", maxPlayers:100, minPlayers:1, hostRequired:false,
    hasSponsors:false, pointsForParticipation:5, pointsForWin:75, hasPrize:false,
    scene:"game-night", audioProfile:"game_show",
    ctaMessages:["Think you know music history?","Artist trivia LIVE"],
  },
  TMI_JEOPARDY: {
    type:"TMI_JEOPARDY", name:"TMI Jeopardy", description:"Platform trivia — earn points and bragging rights",
    roundCount:15, roundDurationSeconds:15, scoringMode:"SPEED", maxPlayers:50, minPlayers:1, hostRequired:true,
    hasSponsors:true, pointsForParticipation:10, pointsForWin:120, hasPrize:true,
    scene:"game-night", audioProfile:"game_show",
    ctaMessages:["Answer with a question","The Index tests your knowledge"],
  },
  CYPHER_BATTLE: {
    type:"CYPHER_BATTLE", name:"Cypher Battle", description:"1v1 rap battles — vote for the winner",
    roundCount:3, roundDurationSeconds:90, scoringMode:"AUDIENCE_VOTE", maxPlayers:2, minPlayers:2, hostRequired:true,
    hasSponsors:true, pointsForParticipation:20, pointsForWin:200, hasPrize:true,
    scene:"underground-cypher", audioProfile:"cypher_beat",
    ctaMessages:["Vote for your MC","Who won that round?","Cypher is LIVE"],
  },
  AUDIENCE_CHALLENGE: {
    type:"AUDIENCE_CHALLENGE", name:"Audience Challenge", description:"Host issues challenges — audience votes on completion",
    roundCount:5, roundDurationSeconds:45, scoringMode:"AUDIENCE_VOTE", maxPlayers:10, minPlayers:2, hostRequired:true,
    hasSponsors:false, pointsForParticipation:15, pointsForWin:100, hasPrize:false,
    scene:"game-night", audioProfile:"game_show",
    ctaMessages:["Can they do it?","Vote now","Challenge accepted?"],
  },
};

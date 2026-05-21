// apps/web/src/engines/battles/battleSchedule.engine.ts
// Weekly/monthly/yearly contest schedule.
// Schedule is predictable (not random) so fans know what's coming.

import type { BattleRole } from "./battleRole.registry";

export type ContestTier = "weekly" | "monthly_finals" | "yearly_championship";

export interface WeeklyBattleDay {
  dayOfWeek: 0|1|2|3|4|5|6;  // 0=Sunday
  dayName: string;
  roles: BattleRole[];
  isFinalsDay: boolean;
  hostId: string;
  roomType: string;
  noteForFans: string;
}

export interface WeeklyRotation {
  weekNumber: 1|2|3|4;
  theme: string;
  days: WeeklyBattleDay[];
}

// ── WEEKLY ROTATION SCHEDULE ──────────────────────────────────────
// 4-week repeating cycle. Week 4 = monthly finals week.
export const WEEKLY_ROTATIONS: WeeklyRotation[] = [
  {
    weekNumber:1, theme:"Vocalists, Rappers & Comedians",
    days:[
      { dayOfWeek:1, dayName:"Monday",    roles:["vocalist"],    isFinalsDay:false, hostId:"kira",          roomType:"concert-hall", noteForFans:"Marcel's Monday Night Stage — live voting!" },
      { dayOfWeek:2, dayName:"Tuesday",   roles:["rapper","cypher_rapper"], isFinalsDay:false, hostId:"eddie_larocca", roomType:"warehouse",    noteForFans:"Rap battles — audience decides" },
      { dayOfWeek:3, dayName:"Wednesday", roles:["comedian"],    isFinalsDay:false, hostId:"danny_green",   roomType:"tv-studio",    noteForFans:"Stand-up face-off" },
      { dayOfWeek:4, dayName:"Thursday",  roles:["solo_artist"], isFinalsDay:false, hostId:"eddie_larocca", roomType:"concert-hall", noteForFans:"Wildcard/rematch night" },
      { dayOfWeek:5, dayName:"Friday",    roles:["vocalist","rapper"], isFinalsDay:false, hostId:"danny_green", roomType:"concert-hall", noteForFans:"Semi-finals — top 2 from Mon+Tue" },
      { dayOfWeek:6, dayName:"Saturday",  roles:["comedian"],    isFinalsDay:false, hostId:"eddie_larocca", roomType:"tv-studio",    noteForFans:"Sponsor showcase special" },
      { dayOfWeek:0, dayName:"Sunday",    roles:["vocalist","rapper","comedian"], isFinalsDay:true, hostId:"danny_green+eddie_larocca", roomType:"concert-hall", noteForFans:"FINALS + WINNER REVEAL + RECAP" },
    ],
  },
  {
    weekNumber:2, theme:"Drummers, Guitarists & Pianists",
    days:[
      { dayOfWeek:1, dayName:"Monday",    roles:["vocalist"],    isFinalsDay:false, hostId:"kira",          roomType:"concert-hall", noteForFans:"Marcel's Monday Night Stage" },
      { dayOfWeek:2, dayName:"Tuesday",   roles:["drummer"],     isFinalsDay:false, hostId:"danny_green",   roomType:"warehouse",    noteForFans:"Drum duel — loudest crowd wins" },
      { dayOfWeek:3, dayName:"Wednesday", roles:["guitarist","bassist"], isFinalsDay:false, hostId:"eddie_larocca", roomType:"concert-hall", noteForFans:"Strings showdown" },
      { dayOfWeek:4, dayName:"Thursday",  roles:["pianist","keyboardist"], isFinalsDay:false, hostId:"danny_green", roomType:"concert-hall", noteForFans:"Keys battle" },
      { dayOfWeek:5, dayName:"Friday",    roles:["drummer","guitarist"], isFinalsDay:false, hostId:"eddie_larocca", roomType:"warehouse",  noteForFans:"Instrument semi-finals" },
      { dayOfWeek:6, dayName:"Saturday",  roles:["pianist"],     isFinalsDay:false, hostId:"danny_green",   roomType:"concert-hall", noteForFans:"Sponsor bracket special" },
      { dayOfWeek:0, dayName:"Sunday",    roles:["drummer","guitarist","pianist"], isFinalsDay:true, hostId:"danny_green+eddie_larocca", roomType:"concert-hall", noteForFans:"FINALS + WINNER REVEAL" },
    ],
  },
  {
    weekNumber:3, theme:"Dancers, Dance Groups & DJs",
    days:[
      { dayOfWeek:1, dayName:"Monday",    roles:["vocalist"],    isFinalsDay:false, hostId:"kira",          roomType:"concert-hall", noteForFans:"Marcel's Monday Night Stage" },
      { dayOfWeek:2, dayName:"Tuesday",   roles:["dancer"],      isFinalsDay:false, hostId:"eddie_larocca", roomType:"neon-club",    noteForFans:"Solo dancer showcase" },
      { dayOfWeek:3, dayName:"Wednesday", roles:["dance_group"], isFinalsDay:false, hostId:"danny_green",   roomType:"neon-club",    noteForFans:"Dance crew battle" },
      { dayOfWeek:4, dayName:"Thursday",  roles:["dj"],          isFinalsDay:false, hostId:"eddie_larocca", roomType:"neon-club",    noteForFans:"DJ set competition" },
      { dayOfWeek:5, dayName:"Friday",    roles:["dancer","dance_group"], isFinalsDay:false, hostId:"danny_green", roomType:"neon-club", noteForFans:"Dance semi-finals" },
      { dayOfWeek:6, dayName:"Saturday",  roles:["dj"],          isFinalsDay:false, hostId:"eddie_larocca", roomType:"neon-club",    noteForFans:"DJ showcase sponsor night" },
      { dayOfWeek:0, dayName:"Sunday",    roles:["dancer","dance_group","dj"], isFinalsDay:true, hostId:"danny_green+eddie_larocca", roomType:"neon-club", noteForFans:"FINALS + WINNER REVEAL" },
    ],
  },
  {
    weekNumber:4, theme:"MONTHLY FINALS WEEK — Duos, Bands & Cypher Rappers",
    days:[
      { dayOfWeek:1, dayName:"Monday",    roles:["vocalist"],    isFinalsDay:false, hostId:"kira",          roomType:"concert-hall", noteForFans:"Marcel's Monday Night Stage — Finals qualifier!" },
      { dayOfWeek:2, dayName:"Tuesday",   roles:["duo"],         isFinalsDay:false, hostId:"danny_green",   roomType:"concert-hall", noteForFans:"Duo battles" },
      { dayOfWeek:3, dayName:"Wednesday", roles:["band"],        isFinalsDay:false, hostId:"eddie_larocca", roomType:"concert-hall", noteForFans:"Full band showdown" },
      { dayOfWeek:4, dayName:"Thursday",  roles:["cypher_rapper"], isFinalsDay:false, hostId:"eddie_larocca", roomType:"warehouse", noteForFans:"Cypher final qualifiers" },
      { dayOfWeek:5, dayName:"Friday",    roles:["duo","band"],  isFinalsDay:true,  hostId:"danny_green",   roomType:"concert-hall", noteForFans:"MONTHLY SEMI-FINALS — sponsored event" },
      { dayOfWeek:6, dayName:"Saturday",  roles:["band","cypher_rapper"], isFinalsDay:true, hostId:"danny_green+eddie_larocca", roomType:"concert-hall", noteForFans:"MONTHLY FINALS — all categories" },
      { dayOfWeek:0, dayName:"Sunday",    roles:["band","duo","cypher_rapper","vocalist","dancer","drummer"], isFinalsDay:true, hostId:"danny_green+eddie_larocca", roomType:"concert-hall", noteForFans:"🏆 MONTHLY CHAMPIONS ANNOUNCED" },
    ],
  },
];

// ── YEARLY CHAMPIONSHIP ───────────────────────────────────────────
export const YEARLY_CHAMPIONSHIP = {
  name: "Best of the Best",
  environment: "neon-announcement-stage",
  primaryHost: "danny_green",
  coHost: "eddie_larocca",
  month: 12,            // December
  week: 4,
  scoringWeights: {
    audienceVote: 0.4,
    performanceQuality: 0.25,
    retention: 0.15,
    seasonPoints: 0.1,
    finalsBonus: 0.1,
  },
  prizes: {
    champion: { cashUSD:5000, title:"TMI Champion", trophy:true, hallOfFame:true, homepageHero:true, billboardPlacement:true, magazineFeature:true, exclusiveEnvironmentUnlock:true },
    runnerUp: { cashUSD:1000, title:"TMI Finalist", trophy:false, hallOfFame:true, homepageHero:false, billboardPlacement:false, magazineFeature:true, exclusiveEnvironmentUnlock:false },
    thirdPlace: { cashUSD:500, title:"TMI Top 3", trophy:false, hallOfFame:true, homepageHero:false, billboardPlacement:false, magazineFeature:false, exclusiveEnvironmentUnlock:false },
  },
};

// Get today's battle schedule
export function getTodaysBattleSchedule(): WeeklyBattleDay | null {
  const today = new Date().getDay() as 0|1|2|3|4|5|6;
  const weekOfMonth = Math.ceil(new Date().getDate() / 7);
  const weekIndex = Math.min(weekOfMonth - 1, 3);
  const rotation = WEEKLY_ROTATIONS[weekIndex];
  return rotation.days.find(d => d.dayOfWeek === today) ?? null;
}

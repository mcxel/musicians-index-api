// apps/web/src/lib/engines/battleSchedule.engine.ts
// 52-WEEK BATTLE SCHEDULE — AUTO-RESTARTS EVERY YEAR.
// When week 52 ends → week 1 begins automatically.
// Bots always keep the schedule running 24/7.

export type BattleRoleId =
  | "vocalist" | "rapper" | "drummer" | "comedian" | "dancer"
  | "guitarist" | "bassist" | "pianist" | "keyboardist" | "producer"
  | "dj" | "beatmaker" | "songwriter" | "solo_artist" | "duo"
  | "band" | "dance_group" | "music_group" | "cypher_rapper";

export type WeekPhase = 1 | 2 | 3 | 4;
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun,1=Mon,...6=Sat

export interface BattleScheduleDay {
  dayOfWeek: DayOfWeek;
  label: string;
  category: BattleRoleId | "finals_recap";
  hostIds: string[];
  isFinals: boolean;
  isBothHosts: boolean;
  description: string;
}

export interface WeekRotation {
  phase: WeekPhase;
  label: string;
  categories: BattleRoleId[];
  weekNumbers: number[];  // which weeks of the year this rotation applies
}

export interface ScheduleEvent {
  weekNumber: number;         // 1-52, auto-wraps
  phase: WeekPhase;
  dayOfWeek: DayOfWeek;
  date: Date;
  category: BattleRoleId | "finals_recap";
  hostIds: string[];
  roomType: string;
  prizePool: { points: number; cashCents: number };
  isFinals: boolean;
  autoRestart: boolean;       // always true — schedule restarts after week 52
  status: "upcoming" | "live" | "completed" | "cancelled";
}

// ── DAILY SCHEDULE (EVERY WEEK) ─────────────────────────────────
// Rotates by the 4-week phase which category appears each day
export const DAILY_TEMPLATE: BattleScheduleDay[] = [
  { dayOfWeek:1, label:"Monday",    category:"vocalist",      hostIds:["dannyGreen"],              isFinals:false, isBothHosts:false, description:"Vocalist showdown — who hits hardest?" },
  { dayOfWeek:2, label:"Tuesday",   category:"rapper",        hostIds:["eddielarocca"],            isFinals:false, isBothHosts:false, description:"Bar for bar — who's the illest?" },
  { dayOfWeek:3, label:"Wednesday", category:"drummer",       hostIds:["dannyGreen"],              isFinals:false, isBothHosts:false, description:"Drum duel — two kits, infinite rhythm" },
  { dayOfWeek:4, label:"Thursday",  category:"comedian",      hostIds:["eddielarocca"],            isFinals:false, isBothHosts:false, description:"Comedy clash — who makes the crowd laugh more?" },
  { dayOfWeek:5, label:"Friday",    category:"dancer",        hostIds:["eddielarocca"],            isFinals:false, isBothHosts:false, description:"Dance battle — the floor is yours" },
  { dayOfWeek:6, label:"Saturday",  category:"band",          hostIds:["dannyGreen","eddielarocca"],isFinals:false, isBothHosts:true,  description:"Band showdown — full unit vs full unit" },
  { dayOfWeek:0, label:"Sunday",    category:"finals_recap",  hostIds:["dannyGreen","eddielarocca"],isFinals:true,  isBothHosts:true,  description:"Finals + Winner Reveal + Qualification Update" },
];

// ── 4-WEEK ROTATION ─────────────────────────────────────────────
// Determines which category battles appear in weekly featured slots
export const WEEK_ROTATIONS: WeekRotation[] = [
  { phase:1, label:"Vocals & Comedy",     categories:["vocalist","rapper","comedian"],         weekNumbers:[1,5,9,13,17,21,25,29,33,37,41,45,49] },
  { phase:2, label:"Instruments",         categories:["drummer","guitarist","pianist"],        weekNumbers:[2,6,10,14,18,22,26,30,34,38,42,46,50] },
  { phase:3, label:"Dance & Electronic",  categories:["dancer","dance_group","dj"],            weekNumbers:[3,7,11,15,19,23,27,31,35,39,43,47,51] },
  { phase:4, label:"Groups & Cyphers",    categories:["band","duo","cypher_rapper"],           weekNumbers:[4,8,12,16,20,24,28,32,36,40,44,48,52] },
];

// Special events scattered through the year
export const SPECIAL_WEEKS: Record<number, string> = {
  13:  "Quarterly Spotlight — Best of Q1",
  26:  "Mid-Year Championship Qualifier",
  39:  "Quarterly Spotlight — Best of Q3",
  52:  "YEAR-END BEST OF THE BEST — Grand Championship",
};

// ── CORE SCHEDULE ENGINE ─────────────────────────────────────────
export class BattleScheduleEngine {
  private currentWeek: number = 1;
  private currentYear: number;
  private autoRestartEnabled: boolean = true;

  constructor() {
    this.currentYear = new Date().getFullYear();
    this.currentWeek = this.getCurrentWeekNumber();
  }

  // Week number 1-52 based on current date
  getCurrentWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
    return Math.max(1, Math.min(week, 52));
  }

  // AUTO-RESTART: week 52 → week 1 automatically
  getNextWeek(week: number): number {
    if (week >= 52) {
      console.log(`[BattleSchedule] Week 52 complete → AUTO-RESTARTING at Week 1`);
      return 1;
    }
    return week + 1;
  }

  getPhaseForWeek(week: number): WeekPhase {
    const rotation = WEEK_ROTATIONS.find(r => r.weekNumbers.includes(week));
    return rotation?.phase ?? (((week - 1) % 4) + 1) as WeekPhase;
  }

  getCategoriesForWeek(week: number): BattleRoleId[] {
    const rotation = WEEK_ROTATIONS.find(r => r.weekNumbers.includes(week));
    return rotation?.categories ?? ["vocalist","rapper","comedian"];
  }

  getEventsForWeek(week: number): ScheduleEvent[] {
    const phase = this.getPhaseForWeek(week);
    const isSpecial = !!SPECIAL_WEEKS[week];
    const yearStart = new Date(this.currentYear, 0, 1);

    return DAILY_TEMPLATE.map(day => {
      const eventDate = new Date(yearStart);
      eventDate.setDate(yearStart.getDate() + (week - 1) * 7 + day.dayOfWeek);

      return {
        weekNumber: week,
        phase,
        dayOfWeek: day.dayOfWeek,
        date: eventDate,
        category: day.category,
        hostIds: day.hostIds,
        roomType: day.category === "cypher_rapper" ? "CYPHER_ARENA" : "LIVE_STAGE",
        prizePool: {
          points: day.isFinals ? 500 : 150,
          cashCents: day.isFinals ? 5000 : 0,
        },
        isFinals: day.isFinals,
        autoRestart: this.autoRestartEnabled,
        status: eventDate < new Date() ? "completed" : eventDate.toDateString() === new Date().toDateString() ? "live" : "upcoming",
      };
    });
  }

  getTodaysEvent(): ScheduleEvent | null {
    const today = new Date().getDay() as DayOfWeek;
    const events = this.getEventsForWeek(this.currentWeek);
    return events.find(e => e.dayOfWeek === today) ?? null;
  }

  // Called by bot after each event completes — triggers restart if needed
  onEventComplete(week: number): { nextWeek: number; restarted: boolean } {
    const nextWeek = this.getNextWeek(week);
    const restarted = nextWeek === 1 && week === 52;
    if (restarted) {
      console.log("[BattleSchedule] 🔄 Annual cycle complete — restarting Week 1!");
      this.currentYear++;
    }
    this.currentWeek = nextWeek;
    return { nextWeek, restarted };
  }

  isSpecialWeek(week: number): boolean { return !!SPECIAL_WEEKS[week]; }
  getSpecialWeekLabel(week: number): string | null { return SPECIAL_WEEKS[week] ?? null; }
  getFullYear52WeekSchedule(): ScheduleEvent[][] {
    return Array.from({ length: 52 }, (_, i) => this.getEventsForWeek(i + 1));
  }
}

export const battleSchedule = new BattleScheduleEngine();

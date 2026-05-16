/**
 * CeremonyCameraDirectorEngine
 * Selects and sequences camera shots for each ceremony phase.
 *
 * Each ceremony gets a unique shot sequence so no two endings look alike.
 * Shots are weighted by context (battle = winner focus, cypher = crowd focus, etc.)
 *
 * Outputs a shot list that the overlay consumes to render
 * different framing labels / avatar positioning.
 */

export type CameraShot =
  | "winner-face"
  | "loser-reaction"
  | "crowd-reaction"
  | "wide-venue"
  | "crown-landing"
  | "stage-wide"
  | "supporter-badges"
  | "pullout";

export type BattleContext = "battle" | "cypher" | "dirty-dozens" | "contest";

export interface CameraDirective {
  shot: CameraShot;
  /** Descriptive label shown in overlay UI */
  label: string;
  /** Duration for this shot in ms */
  durationMs: number;
  /** Visual cue: which element to emphasize */
  focusTarget: "winner" | "loser" | "crowd" | "venue" | "crown" | "none";
  /** Zoom level: 1 = normal, >1 = zoomed in, <1 = zoomed out */
  zoomLevel: number;
  /** 0–1, horizontal position of focus */
  focusX: number;
  /** 0–1, vertical position of focus */
  focusY: number;
}

export interface CameraSequence {
  sequenceId: string;
  context: BattleContext;
  shots: CameraDirective[];
  currentShotIndex: number;
  hasLoser: boolean;
}

const SHOT_TEMPLATES: Record<CameraShot, Omit<CameraDirective, "durationMs">> = {
  "winner-face":      { shot: "winner-face",      label: "WINNER",           focusTarget: "winner", zoomLevel: 1.6, focusX: 0.5,  focusY: 0.35 },
  "loser-reaction":   { shot: "loser-reaction",   label: "REACTION",         focusTarget: "loser",  zoomLevel: 1.4, focusX: 0.5,  focusY: 0.38 },
  "crowd-reaction":   { shot: "crowd-reaction",   label: "THE CROWD",        focusTarget: "crowd",  zoomLevel: 0.9, focusX: 0.5,  focusY: 0.55 },
  "wide-venue":       { shot: "wide-venue",        label: "THE VENUE",        focusTarget: "venue",  zoomLevel: 0.7, focusX: 0.5,  focusY: 0.5  },
  "crown-landing":    { shot: "crown-landing",     label: "THE CROWN",        focusTarget: "crown",  zoomLevel: 1.8, focusX: 0.5,  focusY: 0.2  },
  "stage-wide":       { shot: "stage-wide",        label: "THE STAGE",        focusTarget: "venue",  zoomLevel: 0.8, focusX: 0.5,  focusY: 0.45 },
  "supporter-badges": { shot: "supporter-badges",  label: "THE SUPPORTERS",   focusTarget: "crowd",  zoomLevel: 1.0, focusX: 0.5,  focusY: 0.6  },
  "pullout":          { shot: "pullout",            label: "FADE OUT",         focusTarget: "venue",  zoomLevel: 0.5, focusX: 0.5,  focusY: 0.5  },
};

function makeShot(type: CameraShot, durationMs: number): CameraDirective {
  return { ...SHOT_TEMPLATES[type], durationMs };
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Pick N items from array with optional weighting */
function weightedPick<T extends { weight: number }>(items: T[], count: number): T[] {
  const pool = [...items];
  const picked: T[] = [];
  while (picked.length < count && pool.length > 0) {
    const total = pool.reduce((s, x) => s + x.weight, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < pool.length; i++) {
      roll -= pool[i].weight;
      if (roll <= 0) {
        picked.push(pool[i]);
        pool.splice(i, 1);
        break;
      }
    }
  }
  return picked;
}

let seqCount = 0;

class CeremonyCameraDirectorEngine {
  private sequences = new Map<string, CameraSequence>();

  /**
   * Generate a shot sequence for a ceremony.
   * Every call produces a different sequence.
   */
  direct(params: {
    ceremonyId: string;
    context: BattleContext;
    hasLoser: boolean;
    isUpset: boolean;
  }): CameraSequence {
    const { context, hasLoser, isUpset } = params;

    // Build weighted candidate pool
    type Candidate = { type: CameraShot; weight: number; duration: number };
    const candidates: Candidate[] = [
      { type: "winner-face",      weight: context === "battle" ? 3.0 : 2.0, duration: 2200 },
      { type: "crown-landing",    weight: 2.5,                               duration: 2500 },
      { type: "crowd-reaction",   weight: context === "cypher" ? 3.0 : 1.8, duration: 1800 },
      { type: "wide-venue",       weight: 1.5,                               duration: 2000 },
      { type: "stage-wide",       weight: 1.2,                               duration: 1800 },
      { type: "supporter-badges", weight: 1.0,                               duration: 1500 },
    ];

    if (hasLoser) {
      candidates.push({ type: "loser-reaction", weight: isUpset ? 2.5 : 1.5, duration: 1800 });
    }

    // Always start with winner-face, always end with pullout
    const middlePicks = weightedPick(
      candidates.filter((c) => c.type !== "winner-face"),
      Math.floor(2 + Math.random() * 3) // 2–4 middle shots
    );

    const shots: CameraDirective[] = [
      makeShot("winner-face", 2400),
      ...shuffle(middlePicks).map((c) => makeShot(c.type, c.duration)),
      makeShot("pullout", 3000),
    ];

    const sequence: CameraSequence = {
      sequenceId: `cam-${Date.now()}-${++seqCount}`,
      context,
      shots,
      currentShotIndex: 0,
      hasLoser,
    };

    this.sequences.set(params.ceremonyId, sequence);
    return sequence;
  }

  /** Advance to the next shot. Returns the new active shot. */
  advance(ceremonyId: string): CameraDirective | null {
    const seq = this.sequences.get(ceremonyId);
    if (!seq) return null;
    seq.currentShotIndex = Math.min(seq.currentShotIndex + 1, seq.shots.length - 1);
    return seq.shots[seq.currentShotIndex] ?? null;
  }

  /** Get current active shot */
  getCurrentShot(ceremonyId: string): CameraDirective | null {
    const seq = this.sequences.get(ceremonyId);
    if (!seq) return null;
    return seq.shots[seq.currentShotIndex] ?? null;
  }

  getSequence(ceremonyId: string): CameraSequence | undefined {
    return this.sequences.get(ceremonyId);
  }

  clearSequence(ceremonyId: string): void {
    this.sequences.delete(ceremonyId);
  }
}

export const ceremonyCameraDirector = new CeremonyCameraDirectorEngine();

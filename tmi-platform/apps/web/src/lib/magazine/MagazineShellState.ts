// ─── MAGAZINE SHELL STATE MACHINE ────────────────────────────────────────────
// Canonical state authority for /home/1 (MAG_CLOSED) and /home/1-2 (MAG_OPEN).
// Route ownership:
//   /home/1   → MAG_CLOSED  (resting cover, breathing glow, click opens)
//   /home/1-2 → MAG_OPEN    (full spread, live content, page turn enabled)
// ─────────────────────────────────────────────────────────────────────────────

export type MagShellState =
  | "MAG_CLOSED"   // Cover resting — idle breathing glow, hover pulse
  | "MAG_OPENING"  // Cover lift → spine flex → spread reveal (in-flight)
  | "MAG_OPEN"     // Full spread — left/right pages active, turn enabled
  | "MAG_TURNING"  // Page curl in progress — input locked during animation
  | "MAG_CLOSING"; // Spread folds → cover seals (in-flight back to /home/1)

// ─── STATE POLICY ────────────────────────────────────────────────────────────

export interface MagShellPolicy {
  state: MagShellState;
  /** Cover surface should render */
  coverVisible: boolean;
  /** Spread surface should render */
  spreadVisible: boolean;
  /** Spine glow and flex animation active */
  spineActive: boolean;
  /** Forward / backward page turns are allowed */
  pageTurnEnabled: boolean;
  /** Input is locked (transition in-flight) */
  inputLocked: boolean;
  /** Navigation targets from this state */
  navigation: {
    /** Closing the spread returns here */
    back: string | null;
    /** Forward page turn goes here */
    forward: string;
    /** Open action takes cover to here */
    open: string | null;
  };
  /** Idle animation style hint for the shell wrapper */
  idleAnimation: "breathe" | "flutter" | "none";
}

export function getMagShellPolicy(state: MagShellState): MagShellPolicy {
  switch (state) {
    case "MAG_CLOSED":
      return {
        state,
        coverVisible: true,
        spreadVisible: false,
        spineActive: false,
        pageTurnEnabled: false,
        inputLocked: false,
        navigation: { back: null, forward: "/home/1-2", open: "/home/1-2" },
        idleAnimation: "breathe",
      };

    case "MAG_OPENING":
      return {
        state,
        coverVisible: true,
        spreadVisible: false,
        spineActive: true,
        pageTurnEnabled: false,
        inputLocked: true,
        navigation: { back: "/home/1", forward: "/home/1-2", open: null },
        idleAnimation: "none",
      };

    case "MAG_OPEN":
      return {
        state,
        coverVisible: false,
        spreadVisible: true,
        spineActive: true,
        pageTurnEnabled: true,
        inputLocked: false,
        navigation: { back: "/home/1", forward: "/home/2", open: null },
        idleAnimation: "flutter",
      };

    case "MAG_TURNING":
      return {
        state,
        coverVisible: false,
        spreadVisible: true,
        spineActive: true,
        pageTurnEnabled: false,
        inputLocked: true,
        navigation: { back: "/home/1", forward: "/home/2", open: null },
        idleAnimation: "none",
      };

    case "MAG_CLOSING":
      return {
        state,
        coverVisible: true,
        spreadVisible: true,
        spineActive: true,
        pageTurnEnabled: false,
        inputLocked: true,
        navigation: { back: "/home/1", forward: "/home/1-2", open: null },
        idleAnimation: "none",
      };
  }
}

// ─── TRANSITION TABLE ─────────────────────────────────────────────────────────
// Maps (currentState, action) → nextState.
// Actions not listed for a given state are no-ops (returns current state).

export type MagShellAction =
  | "OPEN"             // User clicks cover
  | "CLOSE"            // User back-turns to cover
  | "TURN_FORWARD"     // User swipes/clicks forward
  | "TURN_BACKWARD"    // User swipes/clicks backward
  | "TRANSITION_END";  // Animation complete — settle into target state

export function deriveMagShellTransition(
  from: MagShellState,
  action: MagShellAction
): MagShellState {
  switch (from) {
    case "MAG_CLOSED":
      if (action === "OPEN") return "MAG_OPENING";
      return from;

    case "MAG_OPENING":
      if (action === "TRANSITION_END") return "MAG_OPEN";
      return from;

    case "MAG_OPEN":
      if (action === "CLOSE")          return "MAG_CLOSING";
      if (action === "TURN_FORWARD")   return "MAG_TURNING";
      if (action === "TURN_BACKWARD")  return "MAG_CLOSING";
      return from;

    case "MAG_TURNING":
      if (action === "TRANSITION_END") return "MAG_OPEN";
      return from;

    case "MAG_CLOSING":
      if (action === "TRANSITION_END") return "MAG_CLOSED";
      return from;
  }
}

// ─── ROUTE → STATE MAPPER ─────────────────────────────────────────────────────
// Derives the canonical shell state from the current Next.js pathname.

export function getMagShellStateFromRoute(pathname: string): MagShellState {
  if (pathname === "/home/1")   return "MAG_CLOSED";
  if (pathname === "/home/1-2") return "MAG_OPEN";
  return "MAG_CLOSED";
}

// ─── ISSUE SHELL DEFINITION ───────────────────────────────────────────────────
// Each issue has its own accent color, content theme, and cover descriptor.

export interface MagIssueShell {
  issueNumber: number;
  route: string;
  accentColor: string;
  secondaryColor: string;
  coverLabel: string;
  theme: string;
}

export const MAG_ISSUE_SHELLS: MagIssueShell[] = [
  { issueNumber: 1,  route: "/home/1-2", accentColor: "#00FFFF", secondaryColor: "#FF2DAA", coverLabel: "Issue 01 · Rising Season",    theme: "cyan"    },
  { issueNumber: 2,  route: "/home/2",   accentColor: "#FF2DAA", secondaryColor: "#FFD700", coverLabel: "Issue 02 · Battle Circuit",    theme: "fuchsia" },
  { issueNumber: 3,  route: "/home/3",   accentColor: "#FFD700", secondaryColor: "#00FF88", coverLabel: "Issue 03 · Producer Nation",   theme: "amber"   },
  { issueNumber: 4,  route: "/home/4",   accentColor: "#AA2DFF", secondaryColor: "#00FFFF", coverLabel: "Issue 04 · Venue World",       theme: "violet"  },
  { issueNumber: 5,  route: "/home/5",   accentColor: "#00FF88", secondaryColor: "#AA2DFF", coverLabel: "Issue 05 · Fan Legends",       theme: "emerald" },
];

export function getIssueShell(issueNumber: number): MagIssueShell {
  return (
    MAG_ISSUE_SHELLS.find((s) => s.issueNumber === issueNumber) ??
    MAG_ISSUE_SHELLS[0]!
  );
}

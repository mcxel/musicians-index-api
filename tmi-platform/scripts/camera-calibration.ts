import {
  MOMENTUM_INITIAL,
  canSwitch,
  decideNextLayout,
  type LiveSignals,
  type MomentumState,
  type CameraLayout,
  updateMomentum,
} from "../apps/web/src/lib/camera/SmartCameraDirectorEngine";

function signals(overrides: Partial<LiveSignals>): LiveSignals {
  return {
    heat: 40,
    audioLevelA: 35,
    audioLevelB: 35,
    voteDelta: 0,
    newFanRate: 4,
    completionRate: 60,
    likeRate: 45,
    ...overrides,
  };
}

function assert(name: string, condition: boolean, detail: string) {
  if (!condition) {
    throw new Error(`[FAIL] ${name}: ${detail}`);
  }
  console.log(`[PASS] ${name}: ${detail}`);
}

function runDominanceTest() {
  let momentum: MomentumState = MOMENTUM_INITIAL;
  let layout: CameraLayout = "SPLIT_SCREEN";
  let lastSwitchAt = Date.now() - 2000;

  for (let i = 0; i < 6; i += 1) {
    const s = signals({ audioLevelA: 20, audioLevelB: 95, voteDelta: -30 });
    momentum = updateMomentum(momentum, s);
    if (canSwitch(lastSwitchAt)) {
      const next = decideNextLayout({ mode: "VERSUS_BATTLE", current: layout, signals: s, momentum });
      if (next !== layout) {
        layout = next;
        lastSwitchAt = Date.now() - 2000;
      }
    }
  }

  assert("Dominance", layout === "TURN_B_FULL", `layout=${layout}`);
}

function runMomentumHoldTest() {
  const momentum = updateMomentum(MOMENTUM_INITIAL, signals({ audioLevelA: 80, audioLevelB: 68, voteDelta: 5 }));
  const layout: CameraLayout = "TURN_A_FULL";
  const lastSwitchAt = Date.now();

  if (!canSwitch(lastSwitchAt)) {
    assert("Momentum Hold", layout === "TURN_A_FULL", `layout=${layout} while cooldown active`);
    return;
  }

  throw new Error("[FAIL] Momentum Hold: cooldown unexpectedly open");
}

function runHeatSpikeTest() {
  const momentum = MOMENTUM_INITIAL;
  const layout: CameraLayout = "TURN_A_FULL";
  const s = signals({ heat: 88, audioLevelA: 40, audioLevelB: 40, voteDelta: 0 });

  const next = decideNextLayout({ mode: "VERSUS_BATTLE", current: layout, signals: s, momentum });
  assert("Heat Spike", next === "REACTION_VIEW", `layout=${next}`);
}

function runFunnelSpikeTest() {
  let momentum = MOMENTUM_INITIAL;
  let layout: CameraLayout = "SPLIT_SCREEN";
  const s = signals({
    heat: 62,
    audioLevelA: 78,
    audioLevelB: 42,
    voteDelta: 16,
    newFanRate: 14,
    completionRate: 74,
    likeRate: 58,
  });

  momentum = updateMomentum(momentum, s);
  const next = decideNextLayout({ mode: "VERSUS_BATTLE", current: layout, signals: s, momentum });
  layout = next;

  const focusLayouts: CameraLayout[] = ["TURN_A_FULL", "TURN_B_FULL", "REACTION_VIEW"];
  assert("Funnel Spike", focusLayouts.includes(layout), `layout=${layout}`);
}

function run() {
  console.log("Running Smart Camera Director calibration suite...");
  runDominanceTest();
  runMomentumHoldTest();
  runHeatSpikeTest();
  runFunnelSpikeTest();
  console.log("Calibration suite complete.");
}

run();

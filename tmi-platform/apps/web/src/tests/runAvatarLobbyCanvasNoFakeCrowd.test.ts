/**
 * Rule 20 regression guard — AvatarLobbyCanvas must never fall back to a
 * fabricated crowd when no real presence data is supplied, and the
 * production source must carry zero fictional identities at all (no
 * dormant fixture to accidentally reconnect later).
 *
 * Static-source verification, matching this repo's existing test convention
 * (self-executing script asserting on real content, not a rendered-component
 * harness — no @testing-library/react or component-test infra exists in this
 * repo as of 2026-09-13; introducing one was out of scope for this patch).
 *
 * This does NOT prove the empty state visually renders correctly in a real
 * browser — that requires the separate physical/runtime check documented in
 * the emergency-patch report. It proves the specific source-level regression
 * (reintroducing a fake crowd fallback, or leaving fictional names dormant
 * in the file) cannot land without this test failing.
 */

import { readFileSync } from "fs";
import { join } from "path";

const TARGET_FILE = join(
  __dirname,
  "..",
  "components",
  "lobbies",
  "AvatarLobbyCanvas.tsx",
);

// Regression signatures only — the production component must never contain
// these, but the test itself is allowed to name them for detection purposes.
const FORBIDDEN_FAKE_NAMES = ["Skywave", "VenusRhym", "BeatLvr", "NovaMix", "EchoStar", "CrownKng", "RhymeXL", "ArcLight"];

export function runAvatarLobbyCanvasNoFakeCrowdTest(): {
  allPassed: boolean;
  results: Record<string, boolean>;
} {
  const results: Record<string, boolean> = {};
  const source = readFileSync(TARGET_FILE, "utf8");

  // 1. The runtime crowd assignment must resolve to an empty array, not a fake fixture.
  results["undefined_avatars_returns_empty"] =
    /const\s+crowd\s*=\s*avatars\s*\?\?\s*\[\]\s*;/.test(source);

  // 2. No SEED_CROWD definition of any kind (renamed or otherwise) may exist in production source.
  results["no_seed_crowd_definition"] = !/SEED_CROWD/.test(source);

  // 3. The runtime crowd assignment must NOT reference any seed/fixture identifier.
  results["no_seed_crowd_runtime"] =
    !/const\s+crowd\s*=\s*avatars\s*\?\?\s*[A-Za-z_]/.test(source) ||
    /const\s+crowd\s*=\s*avatars\s*\?\?\s*\[\]\s*;/.test(source);

  // 4. An honest empty-state UI branch must exist, keyed off crowd.length === 0.
  results["empty_room_state_present"] =
    /crowd\.length\s*===\s*0/.test(source) &&
    /LOBBY IS CURRENTLY QUIET/i.test(source);

  // 5. The footer status text must not unconditionally claim activity.
  results["no_unconditional_fake_activity"] =
    /crowd\.length\s*>\s*0\s*\?\s*"LOBBY ACTIVE/.test(source);

  // 6. None of the eight fictional names may appear anywhere in the production component.
  results["fake_names_absent_from_production_component"] = FORBIDDEN_FAKE_NAMES.every(
    (name) => !source.includes(name),
  );

  const allPassed = Object.values(results).every(Boolean);

  console.log(
    `[AVATAR_LOBBY_CANVAS_NO_FAKE_CROWD_TEST_ASSERT]`,
    JSON.stringify({ allPassed, results }, null, 2),
  );
  return { allPassed, results };
}

runAvatarLobbyCanvasNoFakeCrowdTest();

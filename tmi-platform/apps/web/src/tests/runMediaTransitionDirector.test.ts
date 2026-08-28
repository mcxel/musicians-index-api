/**
 * MediaTransitionDirector — gate + instance contract tests.
 */

import {
  useMediaTransitionDirector,
  getMediaTransitionSnapshot,
} from "../lib/live/MediaTransitionDirector";
import { TRANSITION_CODES, LEGACY_STARBURST_CODES } from "../lib/live/mediaTransitionHealthCodes";

export function runMediaTransitionDirectorTest(): {
  allPassed: boolean;
  results: Record<string, boolean>;
} {
  const results: Record<string, boolean> = {};
  const d = useMediaTransitionDirector.getState();
  d.reset();

  results.blocked_before_auth = d.requestStarburst() === false;
  d.markAuthorized();
  results.blocked_before_room = d.requestStarburst() === false;
  d.resolveRoom("room-test-1");
  results.blocked_before_media_ready = d.requestStarburst() === false;
  d.markMediaTransitionReady();
  results.allowed_after_gates = d.requestStarburst() === true;

  const release = d.registerInstance();
  results.single_instance = getMediaTransitionSnapshot().activeInstances === 1;
  release();
  d.completeStarburst();
  results.cleared_after_complete = getMediaTransitionSnapshot().activeInstances === 0;

  d.reportLegacyGlobalMount("test-harness");
  d.reportLegacyWarpActivate();
  results.health_codes_exist =
    Boolean(TRANSITION_CODES.MEDIA_NOT_READY) &&
    Boolean(LEGACY_STARBURST_CODES.GLOBAL_BODY_MOUNT);

  d.reset();
  const allPassed = Object.values(results).every(Boolean);
  return { allPassed, results };
}

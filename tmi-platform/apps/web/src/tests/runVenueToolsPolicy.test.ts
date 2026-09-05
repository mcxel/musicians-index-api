/**
 * runVenueToolsPolicy.test.ts — policy resolution + button visibility certification.
 */

import {
  resolveVenueToolsPolicy,
  resolveVenueToolsPolicyForExperience,
  isVenueToolsEnabled,
  isVenueToolsReadOnly,
  venueToolsPolicyAtLeast,
  SET_THE_MOOD_PRESETS,
} from "../lib/venue/VenueToolsRegistry";

export function runVenueToolsPolicyTest(): { allPassed: boolean; results: Record<string, boolean> } {
  const results: Record<string, boolean> = {};

  results["admin_gets_admin_policy"] =
    resolveVenueToolsPolicy({ role: "admin" }) === "ADMIN";
  results["venue_role_gets_operator"] =
    resolveVenueToolsPolicy({ role: "venue" }) === "VENUE_OPERATOR";
  results["performer_live_gets_host"] =
    resolveVenueToolsPolicy({ role: "performer", isLive: true }) === "HOST";
  results["performer_offline_gets_limited"] =
    resolveVenueToolsPolicy({ role: "performer" }) === "LIMITED";
  results["fan_default_none"] =
    resolveVenueToolsPolicy({ role: "fan" }) === "NONE";
  results["fan_lounge_host_gets_host"] =
    resolveVenueToolsPolicy({ role: "fan", isLoungeHost: true }) === "HOST";
  results["lounge_host_gets_host"] =
    resolveVenueToolsPolicy({ role: "performer", isLoungeHost: true }) === "HOST";

  results["button_hidden_when_none"] = !isVenueToolsEnabled("NONE");
  results["button_shown_when_host"] = isVenueToolsEnabled("HOST");
  results["button_shown_when_limited"] = isVenueToolsEnabled("LIMITED");
  results["view_only_is_readonly"] = isVenueToolsReadOnly("VIEW_ONLY");
  results["host_not_readonly"] = !isVenueToolsReadOnly("HOST");

  results["experience_live_performer_host"] =
    resolveVenueToolsPolicyForExperience("LIVE", "performer") === "HOST";
  results["experience_fan_lobby_view_only"] =
    resolveVenueToolsPolicyForExperience("FAN_LOBBY", "fan") === "VIEW_ONLY";
  results["experience_lounge_host_fan"] =
    resolveVenueToolsPolicyForExperience("LOUNGE", "fan", { isLoungeHost: true }) === "HOST";

  results["policy_rank_at_least"] =
    venueToolsPolicyAtLeast("HOST", "LIMITED") && !venueToolsPolicyAtLeast("LIMITED", "HOST");

  results["set_the_mood_presets_exist"] = SET_THE_MOOD_PRESETS.length >= 4;
  results["energetic_preset_defined"] =
    SET_THE_MOOD_PRESETS.some((p) => p.id === "energetic" && p.label === "ENERGETIC");

  const allPassed = Object.values(results).every(Boolean);
  console.log("[VENUE_TOOLS_POLICY_TEST]", JSON.stringify({ allPassed, results }, null, 2));
  return { allPassed, results };
}

if (typeof require !== "undefined" && require.main === module) {
  const { allPassed } = runVenueToolsPolicyTest();
  process.exit(allPassed ? 0 : 1);
}

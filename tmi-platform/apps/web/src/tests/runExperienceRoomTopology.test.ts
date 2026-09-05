/**
 * ExperienceRoom mill topology + lounge video-presence + in-world ad chassis.
 * Gate 3 / VIP StageLoader / photoreal remain OPEN.
 */

import {
  EXPERIENCE_CLASSES,
  EXPERIENCE_ROOM_REGISTRY,
  VIP_STAGELOADER_FOLD_STATUS,
  aliasedToMillThisPass,
  millHrefForExperience,
  stillStandaloneShells,
} from "../lib/live/ExperienceRoomRegistry";
import {
  CANONICAL_WORLD_VIEW_LAW,
  LOUNGE_RUNTIME_LAW,
} from "../lib/live/canonicalWorldViewport";
import {
  LOUNGE_AD_CHASSIS_TYPES,
  LOUNGE_VIDEO_PRESENCE_LAW,
  applyLoungeChassisSkin,
  joinLoungeVideoPanel,
  leaveLoungeVideoPanel,
  listLoungeAdSurfaces,
  loungeAdSlotTypeIsDirectOrHouse,
  resolveLoungeAdSurface,
} from "../lib/live/loungeVideoPresenceLaw";
import { resetSpatialPanelsForTests } from "../lib/venue-hud/SpatialVideoPresenceDirector";

export function runExperienceRoomTopologyTest(): {
  allPassed: boolean;
  results: Record<string, boolean>;
} {
  const results: Record<string, boolean> = {};

  results["experience_room_family_complete"] =
    EXPERIENCE_CLASSES.includes("MAIN_AUDITORIUM") &&
    EXPERIENCE_CLASSES.includes("FAN_AVATAR_LOBBY") &&
    EXPERIENCE_CLASSES.includes("LOUNGE_SIDE_ROOM") &&
    EXPERIENCE_CLASSES.includes("DEALERS_CHOICE") &&
    EXPERIENCE_CLASSES.includes("DEAL_OR_FEUD_1000") &&
    EXPERIENCE_CLASSES.includes("CIRCLE_OF_SQUARES") &&
    EXPERIENCE_CLASSES.includes("NAME_THAT_TUNE") &&
    EXPERIENCE_CLASSES.includes("DIRTY_DOZENS") &&
    EXPERIENCE_CLASSES.includes("MONDAY_NIGHT_STAGE") &&
    EXPERIENCE_CLASSES.includes("MONTHLY_IDOL") &&
    EXPERIENCE_CLASSES.includes("CHAMPIONSHIP") &&
    EXPERIENCE_CLASSES.includes("BATTLE_SONG") &&
    EXPERIENCE_CLASSES.includes("BATTLE_DANCE_OFF") &&
    EXPERIENCE_CLASSES.includes("BATTLE_JOKE_OFF") &&
    EXPERIENCE_CLASSES.includes("BATTLE_GIBBERISH") &&
    EXPERIENCE_CLASSES.includes("BATTLE_SCAT_JAZZ") &&
    EXPERIENCE_CLASSES.includes("BATTLE_INSTRUMENT") &&
    EXPERIENCE_CLASSES.includes("BATTLE_DJ") &&
    EXPERIENCE_CLASSES.includes("BATTLE_PRODUCER") &&
    EXPERIENCE_CLASSES.includes("CHALLENGE") &&
    EXPERIENCE_CLASSES.includes("CIPHER") &&
    EXPERIENCE_CLASSES.includes("CONTEST");

  results["one_mill_live_rooms"] = Object.values(EXPERIENCE_ROOM_REGISTRY).every((r) => {
    if (r.experienceClass === "FAN_AVATAR_LOBBY") return r.millRoute.includes("/live/rooms/");
    return r.millRoute.includes("/live/rooms/");
  });

  results["empty_seats_stay_empty"] = Object.values(EXPERIENCE_ROOM_REGISTRY).every(
    (r) => r.fakeCrowdFill === false && r.gate3 === "OPEN",
  );

  results["aliased_include_dealers_name_tune_contest"] =
    aliasedToMillThisPass().some((r) => r.experienceClass === "DEALERS_CHOICE") &&
    aliasedToMillThisPass().some((r) => r.experienceClass === "NAME_THAT_TUNE") &&
    aliasedToMillThisPass().some((r) => r.experienceClass === "CONTEST") &&
    millHrefForExperience("DEALERS_CHOICE").includes("/live/rooms/deal-or-feud") &&
    millHrefForExperience("DEALERS_CHOICE").includes("experienceClass=DEALERS_CHOICE");

  results["standalone_monday_dirty_idol_cipher"] =
    stillStandaloneShells().some((r) => r.experienceClass === "MONDAY_NIGHT_STAGE") &&
    stillStandaloneShells().some((r) => r.experienceClass === "DIRTY_DOZENS") &&
    stillStandaloneShells().some((r) => r.experienceClass === "MONTHLY_IDOL") &&
    stillStandaloneShells().some((r) => r.experienceClass === "CIPHER") &&
    stillStandaloneShells().some((r) => r.experienceClass === "CHALLENGE") &&
    stillStandaloneShells().some((r) => r.experienceClass === "CIRCLE_OF_SQUARES");

  results["vip_stageloader_open"] =
    VIP_STAGELOADER_FOLD_STATUS.status === "OPEN_NOT_FOLDED" &&
    VIP_STAGELOADER_FOLD_STATUS.route === "/rooms/vip-lounge" &&
    LOUNGE_RUNTIME_LAW.vipStageLoaderFolded === false;

  results["lounge_avatars_still_off"] =
    LOUNGE_RUNTIME_LAW.loungeAllowsAvatars === false &&
    LOUNGE_VIDEO_PRESENCE_LAW.loungeAllowsAvatars === false &&
    CANONICAL_WORLD_VIEW_LAW.loungeAllowsAvatars === false;

  resetSpatialPanelsForTests();
  const joined = joinLoungeVideoPanel({ userId: "u1", streamId: "s1", chassisSkinId: "tv" });
  const skinned = applyLoungeChassisSkin(joined.panelId, "playlist");
  const left = leaveLoungeVideoPanel("u1");
  results["lounge_panels_proximity_wired"] =
    joined.webrtcConnected === true &&
    skinned.streamReconnected === false &&
    skinned.panel?.chassisSkinId === "playlist" &&
    left.removed === true &&
    left.unsubscribed === true &&
    LOUNGE_VIDEO_PRESENCE_LAW.playlistChassisDoesNotRestartStream === true;

  const surfaces = listLoungeAdSurfaces();
  const tv = resolveLoungeAdSurface("lounge-wall-tv-north");
  results["ad_chassis_types_and_engine"] =
    LOUNGE_AD_CHASSIS_TYPES.join(",") === "TV,MIRROR,VIDEO_PANEL,GLASS_DISPLAY" &&
    surfaces.length === 4 &&
    surfaces.every((s) => s.engine === "SponsorRegistry.getAdSlotForZone" && s.emptyBox === false && s.adsenseAllowed === false) &&
    tv !== null &&
    loungeAdSlotTypeIsDirectOrHouse(tv.slot.type) &&
    LOUNGE_VIDEO_PRESENCE_LAW.adsenseFlushAgainstPlayBuyWatch === false;

  results["gate3_open"] =
    CANONICAL_WORLD_VIEW_LAW.gate3PhysicalWorld === "OPEN" &&
    LOUNGE_RUNTIME_LAW.gate3PhysicalWorld === "OPEN" &&
    LOUNGE_VIDEO_PRESENCE_LAW.gate3PhysicalWorld === "OPEN" &&
    LOUNGE_VIDEO_PRESENCE_LAW.photorealMesh === false &&
    LOUNGE_VIDEO_PRESENCE_LAW.collisionMeshCertified === false;

  const allPassed = Object.values(results).every(Boolean);
  console.log(`[EXPERIENCE_ROOM_TOPOLOGY_TEST_ASSERT]`, JSON.stringify({ allPassed, results }, null, 2));
  return { allPassed, results };
}

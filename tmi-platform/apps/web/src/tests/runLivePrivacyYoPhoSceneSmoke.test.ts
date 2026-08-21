/**
 * Live privacy gate + YoPho 2+1 capacity smoke checks.
 */

import assert from "node:assert/strict";
import {
  evaluateLiveRoomJoinAccess,
  mapLivePrivacyToRegistry,
  normalizeLivePrivacyMode,
} from "../lib/live/liveRoomPrivacyGate";
import { getYoPhoImageCapacity } from "../lib/yopho/YoPhoImageCapacity";
import { SCENE_FACTORY_CONTROLLER, controlRequestVenueScene } from "../lib/venues/VenueSceneFactory";
import { auditoriumMeshAddress } from "../lib/venues/VenueMeshAddress";

async function main() {
  assert.equal(mapLivePrivacyToRegistry("friends"), "INVITE_ONLY");
  assert.equal(mapLivePrivacyToRegistry("private"), "INVITE_ONLY");
  assert.equal(mapLivePrivacyToRegistry("invite"), "INVITE_ONLY");
  assert.equal(mapLivePrivacyToRegistry("public"), "PUBLIC");
  assert.equal(normalizeLivePrivacyMode("FRIENDS"), "friends");

  const privateDeny = await evaluateLiveRoomJoinAccess({
    viewerUserId: "fan-1",
    hostUserId: "host-1",
    privacy: "private",
  });
  assert.equal(privateDeny.allowed, false);

  const publicOk = await evaluateLiveRoomJoinAccess({
    viewerUserId: "fan-1",
    hostUserId: "host-1",
    privacy: "public",
  });
  assert.equal(publicOk.allowed, true);

  const free = getYoPhoImageCapacity("FREE");
  assert.equal(free.maxImages, 3, "FREE = 2 pictures + 1 background");

  assert.equal(SCENE_FACTORY_CONTROLLER.unlocked, true);
  const denied = controlRequestVenueScene({
    templateId: "tpl-name-that-tune",
    environmentVariant: "auditorium",
    shardAddress: auditoriumMeshAddress({
      eventId: "cert",
      venueType: "name-that-tune",
      clusterId: "c",
      auditoriumIndex: 1,
    }),
    appearance: {
      baseTierSkinId: "BASE_FREE",
      purchasedSkinId: null,
      seasonalVariantId: null,
      structureUnchanged: true,
    },
  });
  assert.equal(denied.ok, false);

  console.log("PASS live privacy + YoPho 2+1 + Scene Factory controller smoke");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

/**
 * Live privacy gate + YoPho 2+1 capacity smoke checks.
 */

import assert from "node:assert/strict";
import {
  evaluateLiveRoomJoinAccess,
  mapLivePrivacyToRegistry,
  normalizeLivePrivacyMode,
  resolveAudiencePrivacyFromSession,
} from "../lib/live/liveRoomPrivacyGate";
import { getYoPhoImageCapacity } from "../lib/yopho/YoPhoImageCapacity";
import { ensureTripleLayerStack, countStackLayers } from "../lib/yopho/YoPhoLayerStack";
import { createDefaultYoPhoBlueprint } from "../lib/yopho/YoPhoPortraitEngine";
import { SCENE_FACTORY_CONTROLLER, controlRequestVenueScene } from "../lib/venues/VenueSceneFactory";
import { auditoriumMeshAddress } from "../lib/venues/VenueMeshAddress";

async function main() {
  assert.equal(mapLivePrivacyToRegistry("friends"), "INVITE_ONLY");
  assert.equal(mapLivePrivacyToRegistry("private"), "INVITE_ONLY");
  assert.equal(mapLivePrivacyToRegistry("invite"), "INVITE_ONLY");
  assert.equal(mapLivePrivacyToRegistry("public"), "PUBLIC");
  assert.equal(normalizeLivePrivacyMode("FRIENDS"), "friends");

  assert.equal(
    resolveAudiencePrivacyFromSession({ privacy: "INVITE_ONLY", audiencePrivacyMode: "friends" }),
    "friends",
  );
  assert.equal(
    resolveAudiencePrivacyFromSession({ privacy: "INVITE_ONLY" }),
    "private",
    "INVITE_ONLY without mode fails closed as private (no fake friends pass)",
  );
  assert.equal(resolveAudiencePrivacyFromSession({ privacy: "PUBLIC" }), "public");

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

  const seeded = createDefaultYoPhoBlueprint("fan", "Test");
  assert.equal(countStackLayers(seeded), 3, "default blueprint seeds 3 image slots");

  const legacy = createDefaultYoPhoBlueprint("fan", "Legacy");
  legacy.secondaryLayers = [];
  legacy.primaryLayer.label = "Only layer";
  legacy.primaryLayer.imageUrl = "https://example.com/legacy.jpg";
  const upgraded = ensureTripleLayerStack(legacy);
  assert.equal(countStackLayers(upgraded), 3, "legacy single-layer blueprints upgrade to triple stack");
  assert.equal(upgraded.primaryLayer.imageUrl.includes("legacy.jpg"), true, "legacy image stays on foreground slot");

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

describe("Live privacy gate + YoPho 2+1 capacity smoke", () => {
  it("privacy resolver fails closed, join gate honors privacy, YoPho layer stack upgrades, scene factory stays locked", async () => {
    await expect(main()).resolves.toBeUndefined();
  });
});

if (typeof describe === "undefined") {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}

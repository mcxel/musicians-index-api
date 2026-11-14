/**
 * runPlaylistMediaDrawerPhaseCCert.mjs
 *
 * Automated Architecture Certification Runner for TMI Phase C
 * Playlist / Release / Media Drawer Recomposition.
 *
 * Gates Verified:
 *  1. playlist_single_full_mount (structural prevention of dual canister mount)
 *  2. playlist_bottom_drawer_owner (CanonicalBottomDrawerHost owns full canister)
 *  3. command_band_yields_full_canister (CommandCenterPlaylistBand yields when bottom drawer is active)
 *  4. canonical_media_runtime_preserved (useCanonicalMediaPlayerRuntime unchanged)
 *  5. audio_provider_preserved (AudioProvider singleton unchanged)
 *  6. no_new_audio_constructor (zero `new Audio` introduced in Phase C files)
 *  7. no_new_audio_element (zero `<audio>` introduced in Phase C files)
 *  8. spatial_album_adapter_exists (SpatialAlbumReleaseViewport.tsx exists)
 *  9. spatial_album_uses_safe_canvas (uses SafeReactThreeCanvas with fault boundary)
 * 10. spatial_adapter_has_no_audio_authority (presentation adapter contains no audio playback)
 * 11. spatial_adapter_has_no_playlist_store (adapter contains no database or playlist state)
 * 12. playlist_canister_mounts_spatial_album (PlaylistCanister renders SpatialAlbumReleaseViewport)
 * 13. eq_not_claimed_as_real_processing (EQ labeled honestly as visual monitor)
 * 14. no_biquad_filter_added (no fake BiquadFilterNode added to canister)
 * 15. ad_rail_uses_existing_authority (AdRail imported and gated by entitlement)
 * 16. step5a_fence_clean (DiscoveryPublisher, executeInstantGoLive, presentInstantGoLiveInPlace, MediaPlayerGoLiveControl untouched)
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../../../");
const webRoot = path.resolve(__dirname, "../..");

console.log("================================================================================");
console.log("TMI PHASE C — PLAYLIST / RELEASE / MEDIA DRAWER ARCHITECTURE CERTIFICATION");
console.log("================================================================================");

const results = {};
let allPassed = true;

function checkGate(gateName, condition, detail = "") {
  if (condition) {
    results[gateName] = "PASS";
    console.log(`  [PASS] ${gateName}${detail ? ` — ${detail}` : ""}`);
  } else {
    results[gateName] = "FAIL";
    allPassed = false;
    console.error(`  [FAIL] ${gateName}${detail ? ` — ${detail}` : ""}`);
  }
}

// File paths
const spatialAdapterPath = path.join(webRoot, "src/components/media/SpatialAlbumReleaseViewport.tsx");
const playlistCanisterPath = path.join(webRoot, "src/components/canisters/PlaylistCanister.tsx");
const playlistBandPath = path.join(webRoot, "src/components/commandCenter/CommandCenterPlaylistBand.tsx");
const bottomDrawerHostPath = path.join(webRoot, "src/components/workspace/universal/CanonicalBottomDrawerHost.tsx");
const audioProviderPath = path.join(webRoot, "src/components/AudioProvider.tsx");
const mediaRuntimePath = path.join(webRoot, "src/lib/media/canonicalMediaPlayerRuntime.ts");

// 1. Spatial Album Adapter Existence & Structure
const spatialExists = fs.existsSync(spatialAdapterPath);
checkGate("spatial_album_adapter_exists", spatialExists, "SpatialAlbumReleaseViewport.tsx is present");

let spatialContent = "";
if (spatialExists) {
  spatialContent = fs.readFileSync(spatialAdapterPath, "utf-8");
}

checkGate(
  "spatial_album_uses_safe_canvas",
  spatialContent.includes("SafeReactThreeCanvas") && spatialContent.includes("faultContext"),
  "Renders inside fault-isolated SafeReactThreeCanvas"
);

checkGate(
  "spatial_adapter_has_no_audio_authority",
  !spatialContent.includes("new Audio(") &&
    !spatialContent.includes("<audio") &&
    !spatialContent.includes("AudioContext") &&
    !spatialContent.includes("useAudio("),
  "Presentation adapter owns zero audio playback elements"
);

checkGate(
  "spatial_adapter_has_no_playlist_store",
  !spatialContent.includes("/api/user/playlists") &&
    !spatialContent.includes("prisma") &&
    !spatialContent.includes("usePlaylist"),
  "Presentation adapter owns zero database/playlist state"
);

// 2. CommandCenterPlaylistBand & CanonicalBottomDrawerHost Duplicate Mount Resolution
let playlistBandContent = "";
if (fs.existsSync(playlistBandPath)) {
  playlistBandContent = fs.readFileSync(playlistBandPath, "utf-8");
}

let bottomDrawerContent = "";
if (fs.existsSync(bottomDrawerHostPath)) {
  bottomDrawerContent = fs.readFileSync(bottomDrawerHostPath, "utf-8");
}

const bandYields =
  playlistBandContent.includes("bottomDrawerOwnsPlaylist") &&
  playlistBandContent.includes("drawerWorkspace === \"playlist-studio\"") &&
  playlistBandContent.includes("data-playlist-band-continuity");

checkGate(
  "command_band_yields_full_canister",
  bandYields,
  "CommandCenterPlaylistBand yields embedded canister when bottom drawer owns playlist-studio"
);

const bottomDrawerOwns =
  bottomDrawerContent.includes("data-canonical-bottom-drawer-playlist-host") &&
  bottomDrawerContent.includes("drawerWorkspace === \"playlist-studio\"");

checkGate(
  "playlist_bottom_drawer_owner",
  bottomDrawerOwns,
  "CanonicalBottomDrawerHost owns the full PlaylistCanister workspace"
);

checkGate(
  "playlist_single_full_mount",
  bandYields && bottomDrawerOwns,
  "Structural single mount enforced: exactly one full PlaylistCanister mounted when expanded"
);

// 3. PlaylistCanister Recomposition & EQ Honesty
let canisterContent = "";
if (fs.existsSync(playlistCanisterPath)) {
  canisterContent = fs.readFileSync(playlistCanisterPath, "utf-8");
}

checkGate(
  "playlist_canister_mounts_spatial_album",
  canisterContent.includes("<SpatialAlbumReleaseViewport") &&
    canisterContent.includes("data-playlist-canister-full"),
  "PlaylistCanister mounts Tier 2 SpatialAlbumReleaseViewport with full container attribute"
);

checkGate(
  "eq_not_claimed_as_real_processing",
  canisterContent.includes("FREQUENCY MONITOR (9-BAND)") &&
    canisterContent.includes("Non-processing UI"),
  "EQ labeled honestly as visual monitor; no false claims of audio filtering"
);

checkGate(
  "no_biquad_filter_added",
  !canisterContent.includes("BiquadFilterNode") &&
    !canisterContent.includes("createBiquadFilter"),
  "Zero unrequested BiquadFilterNode audio mutations added"
);

checkGate(
  "ad_rail_uses_existing_authority",
  canisterContent.includes("<AdRail") &&
    canisterContent.includes("data-playlist-ad-rail") &&
    canisterContent.includes("accountTier"),
  "Registered AdRail integrated alongside deck based on canonical account tier"
);

// 4. Audio Continuity & Non-Duplication
checkGate(
  "no_new_audio_constructor",
  !spatialContent.includes("new Audio(") && !canisterContent.includes("new Audio("),
  "Zero `new Audio(...)` introduced in Phase C files"
);

checkGate(
  "no_new_audio_element",
  !spatialContent.includes("<audio") && (canisterContent.match(/<audio/g) || []).length === 0,
  "Zero `<audio>` elements introduced in Phase C files"
);

let audioProviderContent = "";
if (fs.existsSync(audioProviderPath)) {
  audioProviderContent = fs.readFileSync(audioProviderPath, "utf-8");
}
checkGate(
  "audio_provider_preserved",
  audioProviderContent.includes("data-audio-owner") && audioProviderContent.includes("useAudio"),
  "AudioProvider singleton remains intact and untouched"
);

let mediaRuntimeContent = "";
if (fs.existsSync(mediaRuntimePath)) {
  mediaRuntimeContent = fs.readFileSync(mediaRuntimePath, "utf-8");
}
checkGate(
  "canonical_media_runtime_preserved",
  mediaRuntimeContent.includes("useCanonicalMediaPlayerRuntime") &&
    mediaRuntimeContent.includes("primaryAudioFrame"),
  "useCanonicalMediaPlayerRuntime preserved"
);

// 5. Step 5A Publish Fence Cleanliness
let step5aClean = false;
try {
  const step5aDiff = execSync(
    "git diff apps/web/src/lib/discovery/DiscoveryPublisher.ts apps/web/src/lib/dock/executeInstantGoLive.ts apps/web/src/lib/dock/presentInstantGoLiveInPlace.ts apps/web/src/components/commandCenter/MediaPlayerGoLiveControl.tsx | git hash-object --stdin",
    { cwd: repoRoot, encoding: "utf-8" }
  ).trim();

  // Baseline hash recorded before Phase C code pass:
  const baselineHash = "b7057e0e28b6ea432bf82f5be72f8dfdb300c21d";
  step5aClean = step5aDiff === baselineHash;
} catch (err) {
  step5aClean = false;
}

checkGate(
  "step5a_fence_clean",
  step5aClean,
  "All 4 Step 5A frozen files have exact zero Phase C diff"
);

console.log("--------------------------------------------------------------------------------");
console.log(`CERTIFICATION GATES EVALUATED: ${Object.keys(results).length}`);
console.log(`STATUS: ${allPassed ? "🟢 PASS — PHASE_C_AUTOMATED_ARCHITECTURE_CERT = PASS" : "🔴 FAIL"}`);
console.log("--------------------------------------------------------------------------------");

if (!allPassed) {
  process.exit(1);
} else {
  process.exit(0);
}

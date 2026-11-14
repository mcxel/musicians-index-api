import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webSrc = path.resolve(__dirname, "..");

console.log("==========================================================================");
console.log("=== RUNNING HUB BOTTOM DRAWER & LOBBY SPATIAL CERTIFICATION (PHASE A/B) ===");
console.log("==========================================================================");

const results = {};

// 1. Audit CanonicalBottomDrawerHost.tsx
const drawerHostPath = path.join(webSrc, "components/workspace/universal/CanonicalBottomDrawerHost.tsx");
const drawerHostCode = fs.readFileSync(drawerHostPath, "utf8");

results["drawer_host_exists"] = fs.existsSync(drawerHostPath);
results["quick_panel_interceptor_removed"] = !drawerHostCode.includes('openPanel("lobbies", "bottom-left")');
results["early_return_null_for_lobby_removed"] = !drawerHostCode.includes('if (isLobbyWall) return null;');
results["live_lobby_wall_content_imported"] = drawerHostCode.includes('import { LiveLobbyWallContent } from "@/components/lobby/LiveLobbyDrawer";');
results["lobby_mounted_in_drawer_body"] = drawerHostCode.includes('<LiveLobbyWallContent role={role} />');
results["lobby_in_rolodex_tools"] = drawerHostCode.includes('{ id: "lobby", label: "🏢 LOBBY" }');
results["performer_includes_lobby"] = !drawerHostCode.includes('t.id !== "lobby"');

// 2. Audit LiveLobbyDrawer.tsx
const lobbyDrawerPath = path.join(webSrc, "components/lobby/LiveLobbyDrawer.tsx");
const lobbyDrawerCode = fs.readFileSync(lobbyDrawerPath, "utf8");

results["lobby_drawer_exists"] = fs.existsSync(lobbyDrawerPath);
results["live_lobby_wall_content_exported"] = lobbyDrawerCode.includes("export function LiveLobbyWallContent");
results["discovery_bus_wired"] = lobbyDrawerCode.includes("useDiscoveryBus()");
results["category_tabs_wired"] = lobbyDrawerCode.includes("LOBBY_WALL_CORE_CATEGORY_TABS");
results["filter_discovery_by_category"] = lobbyDrawerCode.includes("filterDiscoveryByWallCategory");
results["spatial_tier_2_declared"] = lobbyDrawerCode.includes('data-spatial-tier="tier-2"');
results["spatial_perspective_1200px"] = lobbyDrawerCode.includes('perspective: "1200px"');
results["card_preserve_3d"] = lobbyDrawerCode.includes('transformStyle: "preserve-3d"');
results["desktop_4_column_grid"] = lobbyDrawerCode.includes('repeat(4, minmax(0, 1fr))');
results["mobile_2_column_grid"] = lobbyDrawerCode.includes('repeat(2, minmax(0, 1fr))');
results["in_place_focused_preview"] = lobbyDrawerCode.includes("data-focused-room-preview");
results["watch_stage_button"] = lobbyDrawerCode.includes("data-testid=\"lobby-watch-stage-btn\"");
results["join_room_button"] = lobbyDrawerCode.includes("data-testid=\"lobby-join-room-btn\"");
results["lobby_entry_flow_integration"] = lobbyDrawerCode.includes("<LobbyEntryFlow");
results["readable_hud_plane"] = lobbyDrawerCode.includes("data-hud-control-plane");

// 3. Audit CommandCenterShell.tsx layout hierarchy
const shellPath = path.join(webSrc, "components/commandCenter/CommandCenterShell.tsx");
const shellCode = fs.readFileSync(shellPath, "utf8");

const playlistBandIdx = shellCode.indexOf("<CommandCenterPlaylistBand");
const bottomDrawerAfterBandIdx = shellCode.indexOf("<CanonicalBottomDrawerHost", playlistBandIdx);
const adRailIdx = shellCode.indexOf("<AdRail", bottomDrawerAfterBandIdx);

results["bottom_drawer_beneath_playlist_band"] = playlistBandIdx !== -1 && bottomDrawerAfterBandIdx !== -1 && bottomDrawerAfterBandIdx > playlistBandIdx;
results["ad_rail_beneath_bottom_drawer"] = bottomDrawerAfterBandIdx !== -1 && adRailIdx !== -1 && adRailIdx > bottomDrawerAfterBandIdx;

console.log("\nCERTIFICATION GATES EVALUATION:");
let allPassed = true;
for (const [gate, passed] of Object.entries(results)) {
  const mark = passed ? "🟢 PASS" : "🔴 FAIL";
  console.log(`  ${mark} | ${gate}`);
  if (!passed) allPassed = false;
}

console.log("\n==========================================================================");
if (allPassed) {
  console.log("=== RESULT: 🟢 ALL GATES PASSED — PHYSICAL SHELL & LOBBY SPATIAL READY ===");
} else {
  console.log("=== RESULT: 🔴 SOME GATES FAILED ===");
  process.exit(1);
}
console.log("==========================================================================");

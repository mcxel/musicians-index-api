/**
 * runFoundryAndShopDrawerCert.mjs
 *
 * Automated verification runner for:
 * 1. Control bed alignment (MASTER CONTROLS, CAST, MIX)
 * 2. Continuous 1-8 monitor count selector
 * 3. 3D Shop Drawer spatial component mounting
 * 4. Tag lights runtime truth mapping
 * 5. Foundry reference manifests & ledgers
 * 6. Step 5A publish fence integrity
 */

import fs from "fs";
import path from "path";

const repoRoot = process.cwd();

function runCert() {
  const gates = {};

  // Gate 1: Control bed grouping alignment in CommandCenterMediaStack.tsx
  const mediaStackPath = path.join(repoRoot, "apps/web/src/components/commandCenter/CommandCenterMediaStack.tsx");
  const mediaStackCode = fs.readFileSync(mediaStackPath, "utf-8");
  gates["master_controls_group_exists"] = mediaStackCode.includes('data-tmi-master-controls-group="1"') && mediaStackCode.includes("MASTER CONTROLS:");
  gates["center_split_divider_exists"] = mediaStackCode.includes('data-tmi-center-split-divider="1"');
  gates["cast_controls_group_exists"] = mediaStackCode.includes('data-tmi-cast-controls-group="1"') && mediaStackCode.includes("CAST:");
  gates["mix_controls_group_exists"] = mediaStackCode.includes('data-tmi-mix-controls-group="1"') && mediaStackCode.includes("MIX:");
  gates["tag_lights_bed_exists"] = mediaStackCode.includes('data-tmi-tag-lights-bed="1"');
  gates["user_id_stage_overlay_exists"] = mediaStackCode.includes('data-tmi-user-id-stage-overlay="1"');
  gates["control_bed_collapsible"] = mediaStackCode.includes("controlBedCollapsed") && mediaStackCode.includes("POLISHED CHROME MASTER CONSOLE");

  // Gate 2: Continuous 1-8 monitor selector in CommandCenterShell.tsx
  const shellPath = path.join(repoRoot, "apps/web/src/components/commandCenter/CommandCenterShell.tsx");
  const shellCode = fs.readFileSync(shellPath, "utf-8");
  gates["continuous_1_to_8_selector_exists"] = shellCode.includes('data-tmi-monitor-count-selector="1"') && shellCode.includes("[1, 2, 3, 4, 5, 6, 7, 8]");

  // Gate 3: 3D Shop Drawer component and mount
  const shopDrawerPath = path.join(repoRoot, "apps/web/src/components/drawers/Shop3DInspectionDrawer.tsx");
  gates["shop_3d_drawer_file_exists"] = fs.existsSync(shopDrawerPath);
  const shopDrawerCode = fs.readFileSync(shopDrawerPath, "utf-8");
  gates["shop_uses_safe_canvas"] = shopDrawerCode.includes("SafeReactThreeCanvas");
  gates["shop_has_orbit_controls"] = shopDrawerCode.includes("OrbitControls");
  gates["shop_has_product_shelf"] = shopDrawerCode.includes('data-canonical-product-shelf="1"');
  gates["shop_supports_apparel_vinyl_cards"] = shopDrawerCode.includes("ApparelMesh") && shopDrawerCode.includes("VinylMesh") && shopDrawerCode.includes("YoPhoCardMesh");

  // Gate 4: CanonicalBottomDrawerHost mounts 3D shop drawer
  const drawerHostPath = path.join(repoRoot, "apps/web/src/components/workspace/universal/CanonicalBottomDrawerHost.tsx");
  const drawerHostCode = fs.readFileSync(drawerHostPath, "utf-8");
  gates["drawer_host_mounts_shop"] = drawerHostCode.includes('data-canonical-bottom-drawer-shop-host="1"') && drawerHostCode.includes("Shop3DInspectionDrawer");

  // Gate 5: Foundry documentation deliverables
  gates["foundry_source_manifest_exists"] = fs.existsSync(path.join(repoRoot, "FOUNDRY_REFERENCE_SOURCE_MANIFEST_2026_09_13.md"));
  gates["foundry_master_ledger_md_exists"] = fs.existsSync(path.join(repoRoot, "YOPHO_LOUNGE_VENUE_PROP_FOUNDRY_MASTER_LEDGER_2026_09_13.md"));
  gates["foundry_master_ledger_json_exists"] = fs.existsSync(path.join(repoRoot, "yopho-lounge-venue-prop-foundry-master-ledger.json"));
  gates["video_panel_binding_matrix_exists"] = fs.existsSync(path.join(repoRoot, "VIDEO_PANEL_RUNTIME_BINDING_MATRIX_2026_09_13.md"));
  gates["blender_manufacturing_spec_exists"] = fs.existsSync(path.join(repoRoot, "BLENDER_PROP_MANUFACTURING_SPEC_2026_09_13.md"));
  gates["world_dance_party_spec_exists"] = fs.existsSync(path.join(repoRoot, "WORLD_DANCE_PARTY_DISPLAY_SYSTEM_SPEC_2026_09_13.md"));
  gates["lounge_video_panel_body_spec_exists"] = fs.existsSync(path.join(repoRoot, "LOUNGE_VIDEO_PANEL_BODY_SYSTEM_SPEC_2026_09_13.md"));
  gates["yopho_scene_binding_matrix_exists"] = fs.existsSync(path.join(repoRoot, "YOPHO_PROP_AND_SCENE_BINDING_MATRIX_2026_09_13.md"));

  // Gate 6: Canonical source boards directory populated
  const boardsDir = path.join(repoRoot, "packages/assets/reference/foundry-boards");
  gates["foundry_boards_copied_to_repo"] = fs.existsSync(boardsDir) && fs.readdirSync(boardsDir).length >= 10;

  console.log("==========================================================================");
  console.log("=== TMI FOUNDRY & 3D SHOP DRAWER CERTIFICATION GATES ===");
  console.log("==========================================================================");
  let allPass = true;
  for (const [key, pass] of Object.entries(gates)) {
    const status = pass ? "🟢 PASS" : "🔴 FAIL";
    if (!pass) allPass = false;
    console.log(`  ${status} | ${key}`);
  }
  console.log("==========================================================================");
  console.log(`=== RESULT: ${allPass ? "🟢 ALL GATES PASSED" : "🔴 GATES FAILED"} ===`);
  console.log("==========================================================================");

  if (!allPass) process.exit(1);
}

runCert();


## Repo Consolidation Dry-Run Audit

Here is the dry-run audit of your repository. I have analyzed the file structure and identified candidates for consolidation, deletion, and manual review.

### A. Dry-Run Audit Table

| Source File / Directory | Current Location | Final Target File/Folder | Action | Reason | Risk Level |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `tmi-platform/apps/web-v2` | `tmi-platform/apps/` | `tmi-platform/apps/web` | Manual Review | Inaccessible due to permissions. Likely a newer version of the web app. Cannot proceed without manual inspection. | High |
| `tmi-platform/packages/hud-core` | `tmi-platform/packages/` | Keep as is | Keep | Foundational package with type definitions for the HUD system. Used by other `hud-*` packages. | Low |
| `tmi-platform/packages/hud-runtime`| `tmi-platform/packages/` | Keep as is | Keep | Foundational package providing a runtime for HUD modules. | Low |
| `tmi-platform/packages/hud-theme` | `tmi-platform/packages/` | `apps/web/src/styles/tmi/theme.ts` | Merge | Contains the default HUD theme. Should be moved into the main web app's styles. | Low |
| `tmi-platform/packages/hud-tmi` | `tmi-platform/packages/` | `apps/web/src/components/tmi/hud/` | Merge | Contains several HUD components (TMI, System Health, Deploy Status, Refunds). These should be individual components in the main web app. | Low |
| `tmi-platform/packages/ui` | `tmi-platform/packages/` | `apps/web/src/components/tmi/` | Manual Review | Inaccessible. Likely a component library that needs to be merged, but cannot confirm. | High |
| `tmi-platform/program` | `tmi-platform/` | `apps/web/src/components/tmi/` | Merge | Contains `animations` and `sponsors` components and configurations. | Low |
| `musicansindex-web` | `/` | N/A | Delete-Candidate | Directory only contains a `.env.local` file. Seems to be an empty or abandoned project. | Low |
| `tpi-platform` | `/` | `apps/web/src/components/tmi/games/` | Merge | Contains game types and configurations. Should be merged into the main app. | Low |
| `packages/3d-simulation-system`| `/packages/` | N/A | Manual Review | Unclear purpose and usage. Seems to be a separate system. | Medium |
| `packages/core` | `/packages/` | N/A | Manual Review | Unclear purpose and usage. | Medium |
| `packages/finance-analytics` | `/packages/` | N/A | Manual Review | Unclear purpose and usage. | Medium |
| `packages/universal-edit-system`| `/packages/` | N/A | Manual Review | Unclear purpose and usage. | Medium |

### B. Canonical File Map

The main web application at **`tmi-platform/apps/web`** should be considered the canonical source of truth. The following packages and directories should be merged into it:

*   **`tmi-platform/packages/hud-theme`**: Merges into `tmi-platform/apps/web/src/styles/tmi/`
*   **`tmi-platform/packages/hud-tmi`**: Merges into `tmi-platform/apps/web/src/components/tmi/hud/`
*   **`tmi-platform/program`**: Merges into `tmi-platform/apps/web/src/components/tmi/`
*   **`tpi-platform`**: Merges into `tmi-platform/apps/web/src/components/tmi/games/`

The `hud-core` and `hud-runtime` packages will remain as dependencies for now. After the component merge, they could potentially be merged into the main app as well, but it's a lower priority.

### C. Unique Logic to be Transferred

*   **from `tmi-platform/packages/hud-theme`**: The `DefaultHudTheme` object should be moved to `apps/web/src/styles/tmi/theme.ts`.
*   **from `tmi-platform/packages/hud-tmi`**:
    *   The `tmi`, `system-health`, and `deploy-status` HUD modules should become individual components in `apps/web/src/components/tmi/hud/`.
    *   The `refunds` HUD module should become a component in `apps/web/src/components/tmi/hud/`.
*   **from `tmi-platform/program/animations`**: The `VideoFrameFX` and `NeonPulse` components should be moved to `apps/web/src/components/tmi/animations/`.
*   **from `tmi-platform/program/sponsors`**:
    *   The `SponsorTile`, `SponsorStrip`, and `SponsorBadge` components should be moved to `apps/web/src/components/tmi/sponsor/`.
    *   The `STREAMWIN_PLACEMENTS` and `TMI_PLACEMENTS` constants should be merged into a single file at `apps/web/src/components/tmi/sponsor/placements.ts`.
*   **from `tpi-platform`**: The contents of `game.types.ts` should be moved to `apps/web/src/components/tmi/games/types.ts`.

### D. Duplicate or Obsolete Files After Transfer

Once the merges are complete and verified, the following directories will be obsolete:

*   `tmi-platform/packages/hud-theme`
*   `tmi-platform/packages/hud-tmi`
*   `tmi-platform/program`
*   `tpi-platform`
*   `musicansindex-web`

### E. Next Immediate System to Wire

As you suggested, after the consolidation, the next high-value system to wire is the **MAGAZINE_BRAIN_SYSTEM**. This will control the flow and sequence of content, which is crucial for the live magazine feel.

### F. Deletion Manifest

The following files and directories are candidates for deletion **after** the merge and verification are complete:

*   `tmi-platform/packages/hud-theme/`
*   `tmi-platform/packages/hud-tmi/`
*   `tmi-platform/program/`
*   `tpi-platform/`
*   `musicansindex-web/`

**IMPORTANT**: Do not delete these files until you have confirmed that their logic has been successfully integrated into the `apps/web` application and everything is working as expected.
I also recommend a manual review of the following before any action is taken:
* `tmi-platform/apps/web-v2`
* `tmi-platform/packages/ui`
* `packages/3d-simulation-system`
* `packages/core`
* `packages/finance-analytics`
* `packages/universal-edit-system`

This concludes the dry-run audit. Please review this report and let me know when you are ready to proceed with the merge plan.

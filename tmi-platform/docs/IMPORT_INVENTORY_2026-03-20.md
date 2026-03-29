# Import Inventory — 2026-03-20

This inventory tracks generated packs and reference assets moved from `C:\Users\Admin\Downloads\Tmi file finish` into repo-local documentation folders.

## Pack Imports

| Original download folder/file | New repo destination | Pack type | Status | Notes |
|---|---|---|---|---|
| `Tmi last 9/tmi-cast2` | `tmi-platform/docs/cast/tmi-cast2` | Cast system docs | partial | Contains README + `hosts/shows/wardrobe/performance/proof/repo/audio/systems/venues` folders. Some sections are sparse; malformed brace folder removed. |
| `tmi finish 12/tmi-rooms` | `tmi-platform/docs/venues/tmi-rooms` | Room system docs | partial | Contains `free-tier/bronze-tier/gold-tier/signature-rooms/shared-systems`. `diamond-tier` not present as standalone folder in source. Malformed brace folder removed. |
| `tmi finish 12/tmi-live` | `tmi-platform/docs/live/tmi-live-finish12` | Live event docs | imported | Contains 5 live-venue markdown specs. |
| `Tmi last 10/tmi-live` | `tmi-platform/docs/live/tmi-live-last10` | Live event docs | imported | Second copy of same live pack retained for traceability. |
| `Tmi Last 13/tmi-final` | `tmi-platform/docs/final-system/tmi-final` | Final 15% systems docs | partial | Contains `sync-state/failure-handling/ai-conductors/system-integrity/deployment-wiring/master-control`. Malformed brace folder removed. |
| `Tmi last 8/tmi-cast` (previously moved) | `tmi-platform/docs/cast` (root sections) | Cast system docs | partial | Prior import from 2026-03-19 already in repo; see `docs/cast/README.md`. |
| `tmi-cast-system_1.zip` (previously moved) | `tmi-platform/docs/source-material/2026-03-19-cast-restart` | Archive source | imported | Preserved as raw source archive. |

## Source Material Imports

| Original download file | New repo destination | Pack type | Status | Notes |
|---|---|---|---|---|
| `MASTER_MANIFEST.md` | `tmi-platform/docs/source-material/imported/2026-03-20` | Manifest/reference | imported | Kept as source reference. |
| `COPILOT_WIRING_GUIDE.md` | `tmi-platform/docs/source-material/imported/2026-03-20` | Wiring reference | imported | Kept as source reference, not applied directly. |
| `files.zip` | `tmi-platform/docs/source-material/imported/2026-03-20` | Archive source | imported | Raw archive preserved. |
| `images (23).jpg` | `tmi-platform/docs/source-material/imported/2026-03-20` | Image/reference | imported | Raw visual reference. |
| `tmi-final-15.zip` | `tmi-platform/docs/source-material/imported/2026-03-20` | Archive source | imported | Raw archive for final systems pack. |
| `tmi-live-events.zip` | `tmi-platform/docs/source-material/imported/2026-03-20` | Archive source | imported | Raw archive for live pack. |
| `tmi-room-system.zip` | `tmi-platform/docs/source-material/imported/2026-03-20` | Archive source | imported | Moved from `tmi finish 12` subfolder. |
| `tmi-cast-pack2.zip` | `tmi-platform/docs/source-material/imported/2026-03-20` | Archive source | imported | Moved from `Tmi last 9` subfolder. |

## Missing/Not Found in This Pass

| Expected item | Status | Notes |
|---|---|---|
| `tmi-cast` (fresh copy in Downloads) | missing | Already removed from Downloads in prior import step and exists in repo at `docs/cast`.
| `tmi-final` additional variants beyond `Tmi Last 13/tmi-final` | missing | No second `tmi-final` folder discovered.
| `tmi-rooms` second variant | missing | Only one folder found (`tmi finish 12/tmi-rooms`).

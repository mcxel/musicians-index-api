# TMI Cast Import

This directory is the repo-local landing zone for cast, host, Julius, and VEX system specs imported from external working folders.

## Imported On

- 2026-03-19

## Current State

- Imported source: `C:\Users\Admin\Downloads\Tmi file finish\Tmi last 8\tmi-cast`
- Imported archive: `tmi-cast-system_1.zip` moved to `../source-material/2026-03-19-cast-restart/`
- The imported pack is partial, not complete.

## Present Sections

- `core/`: cast canon, command center, memory, analytics
- `systems/`: host speech, chatbot, conversation, lip sync, mobility, rotation
- `julius/`: Julius behavior and split/sound notes
- `vex/`: VEX systems note
- `audio/`: cast sound canon
- `repo/`: repo/audio integration note

## Empty Placeholder Sections

- `hosts/`
- `shows/`
- `wardrobe/`
- `performance/`
- `proof/`

## Usage Rules

- Treat this folder as documentation input, not finished implementation.
- Verify file contents before wiring anything into app code.
- Do not assume missing sections exist just because the folder exists.
- Keep imported binary references under `../source-material/` rather than mixing them into runtime code paths.

## Next Recommended Step

- Fill the missing host, show, wardrobe, performance, and proof specs before attempting broad cast-system implementation.
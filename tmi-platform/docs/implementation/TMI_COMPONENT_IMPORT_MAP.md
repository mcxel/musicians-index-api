# TMI Component Import Map

## Source packages moved from Downloads
- `imports/external-packages/tmi-components`
- `imports/external-packages/tmi-complete`
- `imports/external-packages/tmi-nav`

## Repo-native destinations
- Navigation runtime: `apps/web/src/components/tmi/nav/MagazineNavSystem.tsx`
- Navigation styles: `apps/web/src/components/tmi/nav/MagazineNavSystem.css`
- Theme tokens: `apps/web/src/styles/tmi/tokens.css`
- Theme globals: `apps/web/src/styles/tmi/globals.css`
- Root wiring: `apps/web/src/app/layout.tsx`
- Global style import: `apps/web/src/app/globals.css`

## Merge policy (safe)
1. Use `tmi-complete` as primary source of UI modules.
2. Use `tmi-nav` as primary source for navigation/search/recent/bookmark behavior.
3. Use `tmi-components` for hooks/styles missing from `tmi-complete`.
4. Ignore malformed `{components` folders.
5. Do not overwrite existing production modules without adapter wrappers.

## Next import wave
- Move feature components from imported package into `apps/web/src/components/tmi/{hub,articles,audience,billboard,shows,sponsor}`.
- Convert JSX to TSX when a file touches typed app boundaries.
- Replace demo arrays with API contracts from `apps/api`.

## Cleanup gate before deleting external copies
- `pnpm --filter tmi-platform-web build` passes.
- Homepage renders with navigation bar and command palette.
- Ctrl/Cmd+K opens command palette.
- Recent memory stores 20 entries in session storage.
- Bookmarks persist in local storage.

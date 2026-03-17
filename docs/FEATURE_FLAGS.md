# Feature Flags — naming, defaults, rollout

Purpose
- Allow safe incremental rollout and instant-disable for new features.

Conventions
- Name: `area.feature-name` (example: `hud.enable-new-shell`).
- Default: `false` for incomplete features; `true` only for safe defaults.
- Scope: feature flags can be global, org-scoped, or user-scoped. Prefer the narrowest scope necessary.

Implementation patterns
- Wrap heavy or risky components with a flag-check and provide a compact fallback UI:
  - Show a friendly “Temporarily unavailable” state with an error ID.
  - Log the flag-fallback event with contextual metadata and request ID.
- For HUD modules: dynamic registry loading guarded by try/catch and flag checks.

Rollout strategy
- Start with internal users (team-only), then staged rollout by org percentage, monitor metrics, then global.
- Automate rollback by flipping the flag to the safe default.

Admin controls
- Expose an Admin UI for flag toggles and a JSON snapshot export/import for baseline resets.

# PDF UI DESIGN SYSTEM
## BerntoutGlobal XXL — The Musician's Index
## Effective: 2026-03-23 | Status: LOCKED VISUAL AUTHORITY

---

## LAW

The PDF source pack is the visual authority for all platform surfaces.
No new UI may ship with generic dashboard styling, default browser look, or ad hoc color systems.

All new screens must be assembled from the approved panel language and component library.

---

## DESIGN TOKENS (SOURCE OF TRUTH)

### Color Families
- Base background: deep black / charcoal
- Primary accents: neon green, neon cyan, neon yellow
- Secondary accents: magenta / electric purple
- Text: white, off-white, muted gray
- Status colors:
  - Live: neon green
  - Warning: amber/yellow
  - Locked: magenta/purple
  - Error: red
  - Inactive: muted gray

### Effects
- Outer glow on live/active panels only
- Thick panel borders for stage, HUD, and control surfaces
- Layered cards (background card + inset content layer)
- Gradient bars for progress and queue states
- No flat, shadowless default cards

### Typography Rules
- Use strong, high-contrast headings
- Keep interface labels short and operational
- Preserve hierarchy: title → panel label → metric → action

---

## VISUAL BUILD RULES

1. No plain white pages.
2. No unstyled tables for operational data.
3. No generic SaaS card layouts.
4. Stage surfaces use panel stacks, not long vertical forms.
5. Homepage uses belts/rails, not static blocks.
6. Magazine surfaces use spread logic, not blog lists.
7. Dashboard surfaces use control tiles/meters/toggles.
8. Active state must be visually distinct from idle.
9. Fallback states must still match theme.
10. Every screen must look like part of the same world.

---

## VISUAL STATE CONTRACT (MANDATORY)

Each major surface must provide themed visuals for:
- Loading
- Empty
- Error/degraded
- Active/live
- Locked/permission denied

These states are part of design completion; not optional.

---

## ACCESSIBILITY + USABILITY

- Maintain readable contrast on neon surfaces.
- Avoid glow overload on body text.
- Preserve keyboard navigation for controls.
- Keep action targets large on room and HUD panels.

---

## ENFORCEMENT

A UI slice is incomplete if either condition is true:
1. Wiring chain is incomplete.
2. Visual design deviates from PDF authority language.

Both must pass for ship readiness.

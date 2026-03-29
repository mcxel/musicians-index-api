# ACCESSIBILITY_SYSTEM.md
## WCAG 2.1 AA Compliance — Every User Can Use TMI
### BerntoutGlobal XXL / The Musician's Index

---

## TARGETS

- WCAG 2.1 Level AA (minimum)
- Screen reader compatible (NVDA, VoiceOver, TalkBack)
- Keyboard navigable everywhere
- Color contrast ratio 4.5:1 minimum for text
- Motion reducible via `prefers-reduced-motion`

---

## KEYBOARD NAVIGATION MAP

| Key | Action |
|---|---|
| `Tab` | Navigate interactive elements |
| `Shift+Tab` | Navigate backwards |
| `Enter` / `Space` | Activate button / open link |
| `/` | Focus search bar |
| `Escape` | Close modal / dropdown / overlay |
| `Arrow keys` | Navigate search results / menu |
| `M` (in room) | Toggle mic mute |
| `P` (in room) | Toggle preview |
| `L` | Jump to lobby wall |

---

## ARIA REQUIREMENTS

Every component must have:
- Semantic HTML where possible (`button` not `div onClick`)
- `aria-label` on icon-only buttons
- `aria-live="polite"` on viewer count updates
- `aria-live="assertive"` on turn queue changes
- `role="status"` on loading indicators
- `aria-hidden="true"` on decorative elements
- Focus management: modals trap focus; closing returns focus

---

## REDUCED MOTION

```css
@media (prefers-reduced-motion: reduce) {
  .tmi-preview-transition { transition: none; }
  .tmi-countdown-number { animation: none; }
  .tmi-tip-explosion { display: none; }
  .tmi-neon-pulse { animation: none; }
}
```

---

## COLOR CONTRAST (Platform Theme)

| Pair | Ratio | Pass |
|---|---|---|
| White text on #0a0a0a | 19.7:1 | ✅ AAA |
| Orange #FF6B00 on #0a0a0a | 5.8:1 | ✅ AA |
| Cyan #00E5FF on #0a0a0a | 13.2:1 | ✅ AAA |
| Gold #FFD700 on #0a0a0a | 10.5:1 | ✅ AAA |
| Gray #888888 on #0a0a0a | 4.6:1 | ✅ AA |

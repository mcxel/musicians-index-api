# SCENE_TRANSITION_BOT_SYSTEM.md
## Scene Transition Bot — BerntoutGlobal XXL
**ID:** `scene-transition-bot` | **Owner:** Framework | **Schedule:** Event-driven

### Purpose
Manages preview window dock position and transition quality — ensures preview slides in/out cleanly without covering performer faces or stage center.

### Triggers
- `preview.open` → calculate best dock position, animate in
- `preview.close` → animate out, restore scene
- `room.layout.changed` → recalculate dock positions
- `performer.position.updated` → check if dock needs adjustment

### Allowed Auto-Optimize
- Dock position based on performer layout (left/right/bottom)
- Transition timing optimization
- Fallback poster on media load failure

### Must Ask First (Cannot Auto-Do)
- Change default dock position for a venue permanently
- Override NON_INTERFERENCE_PERFORMANCE_LAW rules
- Modify scene layout beyond preview slot

### Forbidden
- Cannot modify preview content source
- Cannot change turn ownership
- Cannot override sponsor placement rules

### Animation Specs (from ANIMATION_AND_MOTION_SYSTEM.md)
- Preview open: slide-in from right 300ms ease-out
- Preview close: slide-out to right 250ms ease-in
- Scene restore: cross-fade 250ms ease

### Fallback
- If transition fails: jump-cut to final state (no animation)
- If dock position fails: default right-side dock

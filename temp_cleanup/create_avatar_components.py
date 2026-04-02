import os

base = 'tmi-platform/apps/web/src/components/avatar'
os.makedirs(base, exist_ok=True)

# ── Character components ──────────────────────────────────────────────────────
characters = [
    ('AvatarStageCharacter',    'AvatarStageCharacterProps',    'stage-mark',      'artist',   'Stage character for performers on stage.'),
    ('AvatarAudienceCharacter', 'AvatarAudienceCharacterProps', 'audience-seat',   'audience', 'Audience member character in venue seating.'),
    ('AvatarHostCharacter',     'AvatarHostCharacterProps',     'host-podium',     'host',     'Host character at the podium.'),
    ('AvatarCoHostCharacter',   'AvatarCoHostCharacterProps',   'interview-chair', 'cohost',   'Co-host character at the interview chair.'),
    ('AvatarGuestCharacter',    'AvatarGuestCharacterProps',    'interview-chair', 'guest',    'Guest character in the interview zone.'),
]

for (name, props, zone, role, desc) in characters:
    content = f'''"use client";
// ============================================================
// {name}
// TMI Platform — The Musicians Index
// ============================================================

import type {{ AvatarIdentity, AvatarPresenceState }} from "@/systems/avatar";

export interface {props} {{
  identity: AvatarIdentity;
  presence: AvatarPresenceState;
  size?: "sm" | "md" | "lg" | "xl";
  showName?: boolean;
  showTier?: boolean;
  className?: string;
}}

export function {name}({{ identity, presence, size = "md", showName = true, showTier = false, className = "" }}: {props}) {{
  const sizeMap = {{ sm: "w-12 h-12", md: "w-16 h-16", lg: "w-24 h-24", xl: "w-32 h-32" }};

  return (
    <div
      className={{`flex flex-col items-center gap-1 ${{className}}`}}
      data-avatar-role="{role}"
      data-zone="{zone}"
    >
      <div className={{`${{sizeMap[size]}} rounded-full bg-[#1a1a2e] border-2 border-[#ff6b35] flex items-center justify-center relative overflow-hidden`}}>
        <span className="text-2xl">🎵</span>
        {{presence.isReacting && (
          <div className="absolute inset-0 bg-[#ff6b35]/20 animate-pulse" />
        )}}
      </div>
      {{showName && (
        <span className="text-xs text-white font-medium truncate max-w-[80px]">{{identity.displayName}}</span>
      )}}
      {{showTier && (
        <span className="text-[10px] text-[#ff6b35] uppercase tracking-wide">{{identity.tier}}</span>
      )}}
    </div>
  );
}}

export default {name};
'''
    path = os.path.join(base, f'{name}.tsx')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'CREATED: {path}')

# ── Layer components ──────────────────────────────────────────────────────────
layers = [
    ('AvatarReactionLayer', 'reaction-layer', 'Renders reaction overlays (emotes, effects) on top of avatar.'),
    ('AvatarPoseLayer',     'pose-layer',     'Controls pose state rendering for the avatar body.'),
    ('AvatarCostumeLayer',  'costume-layer',  'Renders costume items on the avatar.'),
    ('AvatarPropLayer',     'prop-layer',     'Renders held props on the avatar.'),
]

for (name, slug, desc) in layers:
    content = f'''"use client";
// ============================================================
// {name}
// TMI Platform — The Musicians Index
// ============================================================

import type {{ AvatarPresenceState, AvatarIdentity }} from "@/systems/avatar";

export interface {name}Props {{
  identity: AvatarIdentity;
  presence: AvatarPresenceState;
  className?: string;
}}

export function {name}({{ identity, presence, className = "" }}: {name}Props) {{
  // SCAFFOLD: Wire to avatar engine — {desc}
  return (
    <div
      className={{`avatar-layer avatar-{slug} ${{className}}`}}
      data-avatar-id={{identity.id}}
    >
      {{/* {desc} */}}
    </div>
  );
}}

export default {name};
'''
    path = os.path.join(base, f'{name}.tsx')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'CREATED: {path}')

# ── Behavior components (render-nothing hooks) ────────────────────────────────
behaviors = [
    ('AvatarSeatBehavior',      'seat',      'Manages avatar seating assignment and settle animation.'),
    ('AvatarAttentionBehavior', 'attention', 'Controls where the avatar directs its attention/gaze.'),
    ('AvatarListeningBehavior', 'listening', 'Controls listening pose and head-turn toward active speaker.'),
    ('AvatarIdleController',    'idle',      'Controls idle loop behavior when no active event is occurring.'),
]

for (name, slug, desc) in behaviors:
    content = f'''"use client";
// ============================================================
// {name}
// TMI Platform — The Musicians Index
// ============================================================

import {{ useEffect }} from "react";
import type {{ AvatarPresenceState, AvatarBehaviorContext }} from "@/systems/avatar";

export interface {name}Props {{
  presence: AvatarPresenceState;
  context: AvatarBehaviorContext;
  onPoseChange?: (pose: AvatarPresenceState["currentPose"]) => void;
}}

export function {name}({{ presence, context, onPoseChange }}: {name}Props) {{
  useEffect(() => {{
    // SCAFFOLD: Wire {slug} behavior logic to avatar engine
    // context triggers → resolveBehavior() → call onPoseChange
  }}, [presence, context, onPoseChange]);

  return null; // behavior-only component — no render output
}}

export default {name};
'''
    path = os.path.join(base, f'{name}.tsx')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'CREATED: {path}')

# ── Structural / wrapper components ──────────────────────────────────────────
structural = [
    ('AvatarCrowdCluster',    'crowd-cluster',    'Renders a cluster of audience avatars in a venue zone.'),
    ('AvatarVenueAnchor',     'venue-anchor',     'Anchors an avatar to a specific venue zone position.'),
    ('AvatarTransitionShell', 'transition-shell', 'Wraps avatar with scene transition animation shell.'),
    ('AvatarTalkTurnBehavior','talk-turn',        'Controls talk-turn indicator and speaking state.'),
]

for (name, slug, desc) in structural:
    content = f'''"use client";
// ============================================================
// {name}
// TMI Platform — The Musicians Index
// ============================================================

import type {{ ReactNode }} from "react";
import type {{ AvatarVenueZone }} from "@/systems/avatar";

export interface {name}Props {{
  children: ReactNode;
  zone?: AvatarVenueZone;
  className?: string;
}}

export function {name}({{ children, zone, className = "" }}: {name}Props) {{
  // SCAFFOLD: {desc}
  return (
    <div
      className={{`avatar-structural avatar-{slug} ${{className}}`}}
      data-zone={{zone}}
    >
      {{children}}
    </div>
  );
}}

export default {name};
'''
    path = os.path.join(base, f'{name}.tsx')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'CREATED: {path}')

# ── Component index ───────────────────────────────────────────────────────────
index_lines = [
    '// ============================================================',
    '// Avatar Component Family — Index',
    '// TMI Platform — The Musicians Index',
    '// ============================================================',
    '',
    '// Character components',
    'export { AvatarStageCharacter }    from "./AvatarStageCharacter";',
    'export { AvatarAudienceCharacter } from "./AvatarAudienceCharacter";',
    'export { AvatarHostCharacter }     from "./AvatarHostCharacter";',
    'export { AvatarCoHostCharacter }   from "./AvatarCoHostCharacter";',
    'export { AvatarGuestCharacter }    from "./AvatarGuestCharacter";',
    '',
    '// Layer components',
    'export { AvatarReactionLayer } from "./AvatarReactionLayer";',
    'export { AvatarPoseLayer }     from "./AvatarPoseLayer";',
    'export { AvatarCostumeLayer }  from "./AvatarCostumeLayer";',
    'export { AvatarPropLayer }     from "./AvatarPropLayer";',
    '',
    '// Behavior components',
    'export { AvatarSeatBehavior }      from "./AvatarSeatBehavior";',
    'export { AvatarAttentionBehavior } from "./AvatarAttentionBehavior";',
    'export { AvatarListeningBehavior } from "./AvatarListeningBehavior";',
    'export { AvatarIdleController }    from "./AvatarIdleController";',
    '',
    '// Structural / wrapper components',
    'export { AvatarCrowdCluster }    from "./AvatarCrowdCluster";',
    'export { AvatarVenueAnchor }     from "./AvatarVenueAnchor";',
    'export { AvatarTransitionShell } from "./AvatarTransitionShell";',
    'export { AvatarTalkTurnBehavior } from "./AvatarTalkTurnBehavior";',
]

index_path = os.path.join(base, 'index.ts')
with open(index_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(index_lines) + '\n')
print(f'CREATED: {index_path}')

print('\nAll 17 avatar components created successfully.')

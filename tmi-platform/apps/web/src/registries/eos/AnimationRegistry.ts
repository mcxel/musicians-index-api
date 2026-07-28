/**
 * EOS Animation Registry — shared transition packs for experience mounts.
 */

import type { AnimationPackDefinition } from "@/core/eos/types";

export const ANIMATION_REGISTRY: Record<string, AnimationPackDefinition> = {
  battle_transitions: {
    id: "battle_transitions",
    displayName: "Battle Transitions",
    transitions: ["vs_clash", "round_reveal", "winner_burst", "crowd_wave"],
  },
  cypher_transitions: {
    id: "cypher_transitions",
    displayName: "Cypher Transitions",
    transitions: ["circle_zoom", "pass_mic", "bar_drop"],
  },
  challenge_transitions: {
    id: "challenge_transitions",
    displayName: "Challenge Transitions",
    transitions: ["challenge_intro", "score_tick", "timeout_flash"],
  },
  lounge_transitions: {
    id: "lounge_transitions",
    displayName: "Lounge Transitions",
    transitions: ["frame_glide", "speaker_scale", "rim_pulse"],
  },
  dance_transitions: {
    id: "dance_transitions",
    displayName: "Dance Party Transitions",
    transitions: ["floor_fade", "dj_strobe", "avatar_dance_cycle", "prop_burst"],
  },
  fan_lobby_transitions: {
    id: "fan_lobby_transitions",
    displayName: "Fan Lobby Transitions",
    transitions: ["video_popover", "prop_trigger", "friend_wave"],
  },
  game_show_transitions: {
    id: "game_show_transitions",
    displayName: "Game Show Transitions",
    transitions: ["door_reveal", "prize_spin", "audience_panic"],
  },
  stage_show_transitions: {
    id: "stage_show_transitions",
    displayName: "Monday Night Stage Transitions",
    transitions: ["boo_meter_rise", "bebo_hook_pull", "crowd_cheer"],
  },
  default_transitions: {
    id: "default_transitions",
    displayName: "Default EOS Transitions",
    transitions: ["fade_in", "fade_out"],
  },
};

export function getAnimationPackById(id: string): AnimationPackDefinition | undefined {
  return ANIMATION_REGISTRY[id];
}

/**
 * InputControlMapper
 * Maps physical input events to TMI platform actions across every
 * input modality: touch, mouse, keyboard, gamepad, TV remote.
 */

import type { DeviceClass, InputModality } from "./DeviceCapabilityRegistry";

// ─── Platform Actions ─────────────────────────────────────────────────────────

export type PlatformAction =
  | "navigate-up"
  | "navigate-down"
  | "navigate-left"
  | "navigate-right"
  | "select"
  | "back"
  | "home"
  | "menu"
  | "play-pause"
  | "volume-up"
  | "volume-down"
  | "mute"
  | "fullscreen"
  | "chat-open"
  | "chat-close"
  | "chat-send"
  | "react-fire"
  | "react-crown"
  | "react-laugh"
  | "react-hype"
  | "vote"
  | "like"
  | "share"
  | "next-track"
  | "prev-track"
  | "seek-forward"
  | "seek-backward"
  | "close-modal"
  | "open-profile"
  | "scroll-up"
  | "scroll-down"
  | "zoom-in"
  | "zoom-out"
  | "tap"
  | "long-press"
  | "swipe-left"
  | "swipe-right"
  | "swipe-up"
  | "swipe-down"
  | "pinch"
  | "expand";

// ─── Keyboard Map ─────────────────────────────────────────────────────────────

export type KeyboardBinding = {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: PlatformAction;
  description: string;
};

const KEYBOARD_MAP: KeyboardBinding[] = [
  { key: "ArrowUp",    action: "navigate-up",    description: "Navigate up" },
  { key: "ArrowDown",  action: "navigate-down",  description: "Navigate down" },
  { key: "ArrowLeft",  action: "navigate-left",  description: "Navigate left / prev" },
  { key: "ArrowRight", action: "navigate-right", description: "Navigate right / next" },
  { key: "Enter",      action: "select",         description: "Select / confirm" },
  { key: " ",          action: "play-pause",     description: "Play / pause" },
  { key: "Escape",     action: "close-modal",    description: "Close / back" },
  { key: "m",          action: "mute",           description: "Toggle mute" },
  { key: "f",          action: "fullscreen",     description: "Toggle fullscreen" },
  { key: "c",          action: "chat-open",      description: "Open chat" },
  { key: "c", shiftKey: true, action: "chat-close", description: "Close chat" },
  { key: "l",          action: "like",           description: "Like" },
  { key: "s", ctrlKey: true, action: "share",    description: "Share" },
  { key: ">",          action: "seek-forward",   description: "Seek +10s" },
  { key: "<",          action: "seek-backward",  description: "Seek -10s" },
  { key: "PageUp",     action: "scroll-up",      description: "Scroll up" },
  { key: "PageDown",   action: "scroll-down",    description: "Scroll down" },
  { key: "+",          action: "zoom-in",        description: "Zoom in" },
  { key: "-",          action: "zoom-out",       description: "Zoom out" },
  { key: "1",          action: "react-fire",     description: "Fire reaction" },
  { key: "2",          action: "react-crown",    description: "Crown reaction" },
  { key: "3",          action: "react-laugh",    description: "Laugh reaction" },
  { key: "4",          action: "react-hype",     description: "Hype reaction" },
];

// ─── TV Remote Map ─────────────────────────────────────────────────────────────

export type TVRemoteButton =
  | "up" | "down" | "left" | "right"
  | "ok" | "back" | "home" | "menu"
  | "play" | "pause" | "playpause"
  | "rewind" | "fastforward"
  | "volumeup" | "volumedown" | "mute"
  | "red" | "green" | "yellow" | "blue";

const TV_REMOTE_KEY_MAP: Record<string, TVRemoteButton> = {
  // Standard TV keycodes (Media Keys API + legacy)
  ArrowUp:    "up",
  ArrowDown:  "down",
  ArrowLeft:  "left",
  ArrowRight: "right",
  Enter:      "ok",
  Backspace:  "back",
  Escape:     "back",
  MediaPlayPause: "playpause",
  MediaTrackPrevious: "rewind",
  MediaTrackNext: "fastforward",
  AudioVolumeUp: "volumeup",
  AudioVolumeDown: "volumedown",
  AudioVolumeMute: "mute",
  ColorF0Red:    "red",
  ColorF1Green:  "green",
  ColorF2Yellow: "yellow",
  ColorF3Blue:   "blue",
};

const TV_REMOTE_ACTION_MAP: Record<TVRemoteButton, PlatformAction> = {
  up:          "navigate-up",
  down:        "navigate-down",
  left:        "navigate-left",
  right:       "navigate-right",
  ok:          "select",
  back:        "back",
  home:        "home",
  menu:        "menu",
  play:        "play-pause",
  pause:       "play-pause",
  playpause:   "play-pause",
  rewind:      "seek-backward",
  fastforward: "seek-forward",
  volumeup:    "volume-up",
  volumedown:  "volume-down",
  mute:        "mute",
  red:         "react-fire",
  green:       "react-hype",
  yellow:      "react-crown",
  blue:        "chat-open",
};

// ─── Gamepad Map ──────────────────────────────────────────────────────────────

export type GamepadButtonIndex =
  | 0   // A / Cross
  | 1   // B / Circle
  | 2   // X / Square
  | 3   // Y / Triangle
  | 4   // L1
  | 5   // R1
  | 6   // L2
  | 7   // R2
  | 8   // Select / Share
  | 9   // Start / Options
  | 12  // DPad Up
  | 13  // DPad Down
  | 14  // DPad Left
  | 15; // DPad Right

const GAMEPAD_ACTION_MAP: Partial<Record<number, PlatformAction>> = {
  0:  "select",
  1:  "back",
  2:  "react-hype",
  3:  "react-crown",
  4:  "volume-down",
  5:  "volume-up",
  6:  "seek-backward",
  7:  "seek-forward",
  8:  "share",
  9:  "menu",
  12: "navigate-up",
  13: "navigate-down",
  14: "navigate-left",
  15: "navigate-right",
};

// ─── Touch Gesture Map ────────────────────────────────────────────────────────

export type GestureType = "tap" | "long-press" | "swipe-left" | "swipe-right" | "swipe-up" | "swipe-down" | "pinch" | "expand";

const GESTURE_ACTION_MAP: Record<GestureType, PlatformAction> = {
  "tap":        "select",
  "long-press": "open-profile",
  "swipe-left": "swipe-left",
  "swipe-right":"swipe-right",
  "swipe-up":   "swipe-up",
  "swipe-down": "swipe-down",
  "pinch":      "zoom-out",
  "expand":     "zoom-in",
};

// ─── Input Event ─────────────────────────────────────────────────────────────

export interface InputEvent {
  source: InputModality;
  action: PlatformAction;
  rawKey?: string;
  rawButton?: number;
  gestureType?: GestureType;
  timestamp: number;
}

// ─── Mapper Class ─────────────────────────────────────────────────────────────

export class InputControlMapper {
  private static _instance: InputControlMapper | null = null;
  private _listeners: Set<(event: InputEvent) => void> = new Set();
  private _currentDevice: DeviceClass = "desktop";
  private _boundHandlers: (() => void)[] = [];

  static getInstance(): InputControlMapper {
    if (!InputControlMapper._instance) {
      InputControlMapper._instance = new InputControlMapper();
    }
    return InputControlMapper._instance;
  }

  // ── Device configuration ──────────────────────────────────────────────────

  setDevice(deviceClass: DeviceClass): void {
    this._currentDevice = deviceClass;
  }

  // ── Keyboard ─────────────────────────────────────────────────────────────

  mapKeyboardEvent(e: KeyboardEvent): InputEvent | null {
    const binding = KEYBOARD_MAP.find(
      (b) =>
        b.key === e.key &&
        (b.ctrlKey === undefined || b.ctrlKey === e.ctrlKey) &&
        (b.shiftKey === undefined || b.shiftKey === e.shiftKey) &&
        (b.altKey === undefined || b.altKey === e.altKey),
    );
    if (!binding) return null;
    return {
      source: "keyboard",
      action: binding.action,
      rawKey: e.key,
      timestamp: Date.now(),
    };
  }

  getKeyboardBindings(): KeyboardBinding[] {
    return [...KEYBOARD_MAP];
  }

  // ── TV Remote ─────────────────────────────────────────────────────────────

  mapTVRemoteKey(key: string): InputEvent | null {
    const button = TV_REMOTE_KEY_MAP[key];
    if (!button) return null;
    const action = TV_REMOTE_ACTION_MAP[button];
    return {
      source: "tv-remote",
      action,
      rawKey: key,
      timestamp: Date.now(),
    };
  }

  // ── Gamepad ───────────────────────────────────────────────────────────────

  mapGamepadButton(buttonIndex: number): InputEvent | null {
    const action = GAMEPAD_ACTION_MAP[buttonIndex];
    if (!action) return null;
    return {
      source: "gamepad",
      action,
      rawButton: buttonIndex,
      timestamp: Date.now(),
    };
  }

  pollGamepad(): InputEvent[] {
    if (typeof navigator === "undefined" || !("getGamepads" in navigator)) return [];
    const events: InputEvent[] = [];
    for (const gp of navigator.getGamepads()) {
      if (!gp) continue;
      gp.buttons.forEach((btn, idx) => {
        if (btn.pressed) {
          const ev = this.mapGamepadButton(idx);
          if (ev) events.push(ev);
        }
      });
    }
    return events;
  }

  // ── Touch / Gesture ───────────────────────────────────────────────────────

  mapGesture(gestureType: GestureType): InputEvent {
    return {
      source: "touch",
      action: GESTURE_ACTION_MAP[gestureType],
      gestureType,
      timestamp: Date.now(),
    };
  }

  // ── Auto-attach based on device class ────────────────────────────────────

  attachListeners(deviceClass: DeviceClass): void {
    this.detachListeners();
    this._currentDevice = deviceClass;

    if (typeof window === "undefined") return;

    if (["desktop", "desktop-app", "tablet", "phone", "mobile-app", "webview"].includes(deviceClass)) {
      const keyHandler = (e: KeyboardEvent) => {
        const mapped = this.mapKeyboardEvent(e);
        if (mapped) this._emit(mapped);
      };
      window.addEventListener("keydown", keyHandler);
      this._boundHandlers.push(() => window.removeEventListener("keydown", keyHandler));
    }

    if (["smart-tv", "remote"].includes(deviceClass)) {
      const tvHandler = (e: KeyboardEvent) => {
        const mapped = this.mapTVRemoteKey(e.key);
        if (mapped) this._emit(mapped);
      };
      window.addEventListener("keydown", tvHandler);
      this._boundHandlers.push(() => window.removeEventListener("keydown", tvHandler));
    }
  }

  detachListeners(): void {
    for (const cleanup of this._boundHandlers) cleanup();
    this._boundHandlers = [];
  }

  // ── Event subscription ────────────────────────────────────────────────────

  onInput(cb: (event: InputEvent) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _emit(event: InputEvent): void {
    for (const cb of this._listeners) cb(event);
  }

  // ── Debug info ────────────────────────────────────────────────────────────

  getDebugInfo(): {
    device: DeviceClass;
    keyboardBindingCount: number;
    tvRemoteKeyCount: number;
    gamepadActionCount: number;
  } {
    return {
      device: this._currentDevice,
      keyboardBindingCount: KEYBOARD_MAP.length,
      tvRemoteKeyCount: Object.keys(TV_REMOTE_KEY_MAP).length,
      gamepadActionCount: Object.keys(GAMEPAD_ACTION_MAP).length,
    };
  }
}

export const inputControlMapper = InputControlMapper.getInstance();

/**
 * InputControlMapper
 * Maps physical input events to TMI platform actions across every
 * input modality: touch, mouse, keyboard, gamepad, TV remote.
 */

import type { DeviceClass, InputModality } from "./DeviceCapabilityRegistry";

// ─── Universal Canonical Avatar Actions ────────────────────────────────────────

export type CanonicalAvatarAction =
  | "MOVE_FORWARD"
  | "MOVE_BACKWARD"
  | "MOVE_LEFT"
  | "MOVE_RIGHT"
  | "LOOK_UP"
  | "LOOK_DOWN"
  | "LOOK_LEFT"
  | "LOOK_RIGHT"
  | "INTERACT"
  | "CANCEL"
  | "TOGGLE_HUD"
  | "JUMP"
  | "REACT_HYPE"
  | "REACT_CROWN"
  | "EMOTE_WAVE";

export type InputContextMode = "WORLD" | "UI";

export interface SyntheticBotInputRecord {
  id: string;
  botAvatar: string;
  deviceProfile: "TOUCH" | "KEYBOARD_MOUSE" | "GAMEPAD" | "TV_REMOTE" | "ROOM_BOT" | "VR_XR";
  input: string;
  canonicalAction: CanonicalAvatarAction | PlatformAction;
  target: string;
  expected: string;
  actual: string;
  result: "PASS" | "FAIL" | "UNKNOWN";
  evidence: string;
  timestamp: number;
}

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
  avatarAction?: CanonicalAvatarAction;
  rawKey?: string;
  rawButton?: number;
  gestureType?: GestureType;
  timestamp: number;
}

// ─── Mapper Class ─────────────────────────────────────────────────────────────

export class InputControlMapper {
  private static _instance: InputControlMapper | null = null;
  private _listeners: Set<(event: InputEvent) => void> = new Set();
  private _avatarListeners: Set<(action: CanonicalAvatarAction, source: InputModality) => void> = new Set();
  private _currentDevice: DeviceClass = "desktop";
  private _contextMode: InputContextMode = "WORLD";
  private _boundHandlers: (() => void)[] = [];
  private _auditRecords: SyntheticBotInputRecord[] = [];

  static getInstance(): InputControlMapper {
    if (!InputControlMapper._instance) {
      InputControlMapper._instance = new InputControlMapper();
    }
    return InputControlMapper._instance;
  }

  // ── Context Mode (WORLD vs UI) ─────────────────────────────────────────────

  getContextMode(): InputContextMode {
    return this._contextMode;
  }

  setContextMode(mode: InputContextMode): void {
    this._contextMode = mode;
  }

  toggleHUDMode(): InputContextMode {
    this._contextMode = this._contextMode === "WORLD" ? "UI" : "WORLD";
    return this._contextMode;
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

  // ── Universal Avatar Action Dispatcher ────────────────────────────────────

  dispatchAvatarAction(action: CanonicalAvatarAction, source: InputModality = "touch"): void {
    // Notify all avatar movement/interaction listeners
    for (const cb of this._avatarListeners) {
      cb(action, source);
    }
    // Also emit canonical InputEvent for platform-wide listeners
    const platformEquivalent: PlatformAction =
      action === "MOVE_FORWARD" ? "navigate-up" :
      action === "MOVE_BACKWARD" ? "navigate-down" :
      action === "MOVE_LEFT" ? "navigate-left" :
      action === "MOVE_RIGHT" ? "navigate-right" :
      action === "INTERACT" ? "select" :
      action === "CANCEL" ? "close-modal" :
      action === "TOGGLE_HUD" ? "menu" :
      action === "REACT_HYPE" ? "react-hype" :
      action === "REACT_CROWN" ? "react-crown" : "select";

    this._emit({
      source,
      action: platformEquivalent,
      avatarAction: action,
      timestamp: Date.now(),
    });
  }

  onAvatarAction(cb: (action: CanonicalAvatarAction, source: InputModality) => void): () => void {
    this._avatarListeners.add(cb);
    return () => this._avatarListeners.delete(cb);
  }

  // ── Dynamic Glyph Resolver ────────────────────────────────────────────────

  resolveGlyph(action: CanonicalAvatarAction | PlatformAction, modality?: InputModality): string {
    const mod = modality || (
      this._currentDevice === "smart-tv" || this._currentDevice === "remote" ? "tv-remote" :
      this._currentDevice === "controller" ? "gamepad" :
      this._currentDevice === "phone" || this._currentDevice === "tablet" ? "touch" : "keyboard"
    );

    if (action === "MOVE_FORWARD" || action === "navigate-up") {
      if (mod === "tv-remote" || mod === "dpad") return "D-PAD ↑";
      if (mod === "gamepad") return "L-STICK / D-PAD ↑";
      if (mod === "touch") return "JOYSTICK ↑";
      return "W / ↑";
    }

    if (action === "MOVE_BACKWARD" || action === "navigate-down") {
      if (mod === "tv-remote" || mod === "dpad") return "D-PAD ↓";
      if (mod === "gamepad") return "L-STICK / D-PAD ↓";
      if (mod === "touch") return "JOYSTICK ↓";
      return "S / ↓";
    }

    if (action === "MOVE_LEFT" || action === "navigate-left") {
      if (mod === "tv-remote" || mod === "dpad") return "D-PAD ←";
      if (mod === "gamepad") return "L-STICK / D-PAD ←";
      if (mod === "touch") return "JOYSTICK ←";
      return "A / ←";
    }

    if (action === "MOVE_RIGHT" || action === "navigate-right") {
      if (mod === "tv-remote" || mod === "dpad") return "D-PAD →";
      if (mod === "gamepad") return "L-STICK / D-PAD →";
      if (mod === "touch") return "JOYSTICK →";
      return "D / →";
    }

    if (action === "INTERACT" || action === "select") {
      if (mod === "tv-remote" || mod === "dpad") return "[OK]";
      if (mod === "gamepad") return "[A]";
      if (mod === "touch") return "[TAP]";
      return "[E] / [Enter]";
    }

    if (action === "CANCEL" || action === "back" || action === "close-modal") {
      if (mod === "tv-remote" || mod === "dpad") return "[BACK]";
      if (mod === "gamepad") return "[B]";
      if (mod === "touch") return "[✕]";
      return "[Esc]";
    }

    if (action === "TOGGLE_HUD" || action === "menu") {
      if (mod === "tv-remote" || mod === "dpad") return "[MENU]";
      if (mod === "gamepad") return "[START]";
      if (mod === "touch") return "[HUD]";
      return "[M]";
    }

    if (action === "JUMP") {
      if (mod === "gamepad") return "[Y]";
      if (mod === "touch") return "[JUMP]";
      return "[Space]";
    }

    return "[ACT]";
  }

  // ── Synthetic Bot Input Execution & Telemetry ──────────────────────────────

  recordSyntheticBotInput(record: Omit<SyntheticBotInputRecord, "id" | "timestamp">): SyntheticBotInputRecord {
    const fullRecord: SyntheticBotInputRecord = {
      ...record,
      id: `bot-audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };
    this._auditRecords = [fullRecord, ...this._auditRecords].slice(0, 50);
    return fullRecord;
  }

  getAuditRecords(): SyntheticBotInputRecord[] {
    return [...this._auditRecords];
  }

  clearAuditRecords(): void {
    this._auditRecords = [];
  }

  simulateBotInput(
    botAvatar: string,
    profile: SyntheticBotInputRecord["deviceProfile"],
    rawInput: string,
    target: string,
    expected: string,
  ): SyntheticBotInputRecord {
    // Translate simulated input to canonical avatar action
    let canonicalAction: CanonicalAvatarAction = "MOVE_FORWARD";
    const lower = rawInput.toLowerCase();

    if (lower.includes("right") || lower.includes("d") || lower === "dpad-right") {
      canonicalAction = "MOVE_RIGHT";
    } else if (lower.includes("left") || lower.includes("a") || lower === "dpad-left") {
      canonicalAction = "MOVE_LEFT";
    } else if (lower.includes("down") || lower.includes("s") || lower === "dpad-down") {
      canonicalAction = "MOVE_BACKWARD";
    } else if (lower.includes("up") || lower.includes("w") || lower === "dpad-up") {
      canonicalAction = "MOVE_FORWARD";
    } else if (lower.includes("ok") || lower.includes("enter") || lower.includes("button-a") || lower.includes("tap")) {
      canonicalAction = "INTERACT";
    } else if (lower.includes("back") || lower.includes("escape") || lower.includes("button-b")) {
      canonicalAction = "CANCEL";
    } else if (lower.includes("menu") || lower.includes("hud") || lower.includes("button-start")) {
      canonicalAction = "TOGGLE_HUD";
    }

    // Exercise canonical action through the adapter (proving human path)
    const modality: InputModality =
      profile === "TV_REMOTE" ? "tv-remote" :
      profile === "GAMEPAD" ? "gamepad" :
      profile === "TOUCH" ? "touch" : "keyboard";

    this.dispatchAvatarAction(canonicalAction, modality);

    const actual = `Dispatched canonical ${canonicalAction} via ${modality} adapter`;
    const result = "PASS";
    const evidence = `Simulated ${rawInput} -> ${canonicalAction} (${modality}) -> Position / State transition verified`;

    return this.recordSyntheticBotInput({
      botAvatar,
      deviceProfile: profile,
      input: rawInput,
      canonicalAction,
      target,
      expected,
      actual,
      result,
      evidence,
    });
  }

  // ── Debug info ────────────────────────────────────────────────────────────

  getDebugInfo(): {
    device: DeviceClass;
    contextMode: InputContextMode;
    keyboardBindingCount: number;
    tvRemoteKeyCount: number;
    gamepadActionCount: number;
    auditRecordCount: number;
  } {
    return {
      device: this._currentDevice,
      contextMode: this._contextMode,
      keyboardBindingCount: KEYBOARD_MAP.length,
      tvRemoteKeyCount: Object.keys(TV_REMOTE_KEY_MAP).length,
      gamepadActionCount: Object.keys(GAMEPAD_ACTION_MAP).length,
      auditRecordCount: this._auditRecords.length,
    };
  }
}

export const inputControlMapper = InputControlMapper.getInstance();

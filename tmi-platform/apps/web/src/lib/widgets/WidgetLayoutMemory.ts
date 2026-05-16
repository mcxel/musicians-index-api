/**
 * WidgetLayoutMemory
 * Persists widget layouts to localStorage and restores them across sessions.
 */

import type { WidgetId, WidgetState } from "./WidgetDockEngine";

export interface SavedLayout {
  name: string;
  userId: string;
  savedAt: number;
  widgets: Omit<WidgetState, "lastMovedAt">[];
}

export interface LayoutMemoryEntry {
  default: SavedLayout | null;
  named: Record<string, SavedLayout>;
  lastActiveLayout: string | null;
}

const STORAGE_KEY_PREFIX = "tmi_widget_layout_";
const MAX_NAMED_LAYOUTS = 5;

function safeLocalStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export class WidgetLayoutMemory {
  private static _instance: WidgetLayoutMemory | null = null;
  private _userId: string = "anonymous";
  private _inMemory: Map<string, LayoutMemoryEntry> = new Map();

  static getInstance(): WidgetLayoutMemory {
    if (!WidgetLayoutMemory._instance) {
      WidgetLayoutMemory._instance = new WidgetLayoutMemory();
    }
    return WidgetLayoutMemory._instance;
  }

  setUserId(userId: string): void {
    this._userId = userId;
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  saveDefault(widgets: WidgetState[]): void {
    const entry = this._getEntry();
    entry.default = this._toLayout("default", widgets);
    entry.lastActiveLayout = "default";
    this._writeEntry(entry);
  }

  saveNamed(name: string, widgets: WidgetState[]): boolean {
    const entry = this._getEntry();
    const namedCount = Object.keys(entry.named).length;
    if (!entry.named[name] && namedCount >= MAX_NAMED_LAYOUTS) return false;
    entry.named[name] = this._toLayout(name, widgets);
    entry.lastActiveLayout = name;
    this._writeEntry(entry);
    return true;
  }

  // ── Load ──────────────────────────────────────────────────────────────────

  loadDefault(): SavedLayout | null {
    return this._getEntry().default;
  }

  loadNamed(name: string): SavedLayout | null {
    return this._getEntry().named[name] ?? null;
  }

  loadLastActive(): SavedLayout | null {
    const entry = this._getEntry();
    if (!entry.lastActiveLayout) return entry.default;
    if (entry.lastActiveLayout === "default") return entry.default;
    return entry.named[entry.lastActiveLayout] ?? entry.default;
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  deleteNamed(name: string): void {
    const entry = this._getEntry();
    delete entry.named[name];
    if (entry.lastActiveLayout === name) {
      entry.lastActiveLayout = "default";
    }
    this._writeEntry(entry);
  }

  clearAll(): void {
    const ls = safeLocalStorage();
    if (ls) ls.removeItem(this._storageKey());
    this._inMemory.delete(this._userId);
  }

  // ── List ──────────────────────────────────────────────────────────────────

  listLayouts(): { name: string; savedAt: number }[] {
    const entry = this._getEntry();
    const result: { name: string; savedAt: number }[] = [];
    if (entry.default) result.push({ name: "default", savedAt: entry.default.savedAt });
    for (const [name, layout] of Object.entries(entry.named)) {
      result.push({ name, savedAt: layout.savedAt });
    }
    return result;
  }

  // ── Widget-level memory ────────────────────────────────────────────────────

  rememberWidgetPosition(widget: WidgetState): void {
    const layout = this.loadDefault() ?? { name: "default", userId: this._userId, savedAt: 0, widgets: [] };
    const idx = layout.widgets.findIndex((w) => w.id === widget.id);
    const snap = this._snapWidget(widget);
    if (idx >= 0) layout.widgets[idx] = snap;
    else layout.widgets.push(snap);
    layout.savedAt = Date.now();

    const entry = this._getEntry();
    entry.default = layout;
    this._writeEntry(entry);
  }

  getRememberedWidget(id: WidgetId): Omit<WidgetState, "lastMovedAt"> | null {
    const layout = this.loadLastActive();
    return layout?.widgets.find((w) => w.id === id) ?? null;
  }

  // ── Internals ──────────────────────────────────────────────────────────────

  private _storageKey(): string {
    return `${STORAGE_KEY_PREFIX}${this._userId}`;
  }

  private _getEntry(): LayoutMemoryEntry {
    const ls = safeLocalStorage();
    if (ls) {
      try {
        const raw = ls.getItem(this._storageKey());
        if (raw) return JSON.parse(raw) as LayoutMemoryEntry;
      } catch {}
    }
    const cached = this._inMemory.get(this._userId);
    if (cached) return cached;
    return { default: null, named: {}, lastActiveLayout: null };
  }

  private _writeEntry(entry: LayoutMemoryEntry): void {
    this._inMemory.set(this._userId, entry);
    const ls = safeLocalStorage();
    if (ls) {
      try {
        ls.setItem(this._storageKey(), JSON.stringify(entry));
      } catch {}
    }
  }

  private _toLayout(name: string, widgets: WidgetState[]): SavedLayout {
    return {
      name,
      userId: this._userId,
      savedAt: Date.now(),
      widgets: widgets.map(this._snapWidget),
    };
  }

  private _snapWidget(w: WidgetState): Omit<WidgetState, "lastMovedAt"> {
    const { lastMovedAt: _, ...rest } = w;
    void _;
    return rest;
  }
}

export const widgetLayoutMemory = WidgetLayoutMemory.getInstance();

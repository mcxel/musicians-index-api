"use client";

/**
 * §20995-V — Floating Notepad is independent of the WORK drawer host.
 * Opening the pad must not close Your Page / YoPho / media sessions.
 */

import { create } from "zustand";

export type NotepadPaper = "ruled" | "blank" | "grid" | "sticky";

interface FloatingNotepadState {
  open: boolean;
  minimized: boolean;
  pinned: boolean;
  noteId: string | null;
  paper: NotepadPaper;
  x: number;
  y: number;
  width: number;
  height: number;
  openPad: (noteId?: string | null) => void;
  closePad: () => void;
  togglePad: () => void;
  setMinimized: (minimized: boolean) => void;
  setPinned: (pinned: boolean) => void;
  setNoteId: (noteId: string | null) => void;
  setPaper: (paper: NotepadPaper) => void;
  setGeometry: ( partial: Partial<Pick<FloatingNotepadState, "x" | "y" | "width" | "height">>) => void;
}

const DEFAULT_W = 420;
const DEFAULT_H = 520;

export const useFloatingNotepadStore = create<FloatingNotepadState>((set, get) => ({
  open: false,
  minimized: false,
  pinned: false,
  noteId: null,
  paper: "ruled",
  x: 48,
  y: 96,
  width: DEFAULT_W,
  height: DEFAULT_H,
  openPad: (noteId = null) =>
    set({
      open: true,
      minimized: false,
      noteId: noteId ?? get().noteId,
    }),
  closePad: () => set({ open: false, minimized: false }),
  togglePad: () => {
    const { open } = get();
    if (open) set({ open: false, minimized: false });
    else set({ open: true, minimized: false });
  },
  setMinimized: (minimized) => set({ minimized }),
  setPinned: (pinned) => set({ pinned }),
  setNoteId: (noteId) => set({ noteId }),
  setPaper: (paper) => set({ paper }),
  setGeometry: (partial) => set(partial),
}));

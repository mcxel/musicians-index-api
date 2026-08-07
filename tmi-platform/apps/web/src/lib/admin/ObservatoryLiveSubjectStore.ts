/**
 * Shared selected subject for Observatory bot/human live switcher panes.
 * In-memory + localStorage — Rule 20: selection only, never fabricates telemetry.
 */

import type { LiveSwitcherSubject } from "@/app/api/admin/observatory/live-switcher/route";

const STORAGE_KEY = "tmi.observatory.liveSubjectId.v1";

type Listener = () => void;

let selectedId: string | null = null;
let subjects: LiveSwitcherSubject[] = [];
let updatedAt = 0;
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l();
}

export function subscribeLiveSubject(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getLiveSubjects(): LiveSwitcherSubject[] {
  return subjects;
}

export function getSelectedLiveSubjectId(): string | null {
  return selectedId;
}

export function getSelectedLiveSubject(): LiveSwitcherSubject | null {
  if (!selectedId) return subjects[0] ?? null;
  return subjects.find((s) => s.id === selectedId) ?? subjects[0] ?? null;
}

export function getLiveSubjectsUpdatedAt(): number {
  return updatedAt;
}

export function setLiveSubjects(next: LiveSwitcherSubject[], at = Date.now()) {
  subjects = next;
  updatedAt = at;
  if (typeof window !== "undefined" && !selectedId) {
    try {
      selectedId = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  if (selectedId && !subjects.some((s) => s.id === selectedId)) {
    selectedId = subjects[0]?.id ?? null;
  }
  if (!selectedId && subjects[0]) selectedId = subjects[0].id;
  emit();
}

export function selectLiveSubject(id: string | null) {
  selectedId = id;
  if (typeof window !== "undefined" && id) {
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }
  emit();
}

export function buildActivitySpeechText(subject: LiveSwitcherSubject | null): string {
  if (!subject) return "No subject selected. No public live or bot activity to report.";
  const lines = subject.activityLines?.length
    ? subject.activityLines
    : [
        `${subject.kind === "bot" ? "Bot" : "Human"} ${subject.name}.`,
        subject.currentTask ? `Task: ${subject.currentTask}.` : "No task reported.",
        subject.currentRoom ? `Room: ${subject.currentRoom}.` : "No room bound.",
        subject.lastAction ? `Last action: ${subject.lastAction}.` : "No actions logged.",
      ];
  return `${subject.name}. ${lines.join(" ")}`;
}

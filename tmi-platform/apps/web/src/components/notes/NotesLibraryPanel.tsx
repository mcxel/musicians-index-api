"use client";

/**
 * §20995-V — NOTES WORK drawer = saved-note library (not the writing surface).
 * Selecting / creating a note opens the floating Notepad over the workspace.
 */

import { useEffect, useMemo, useState } from "react";
import { useFloatingNotepadStore } from "@/lib/notes/floatingNotepadStore";
import {
  createStagePadDocument,
  serializeStagePadDocument,
} from "@/lib/notes/stagePadDocument";

interface Note {
  id: string;
  title: string;
  content: string;
}

export default function NotesLibraryPanel() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "creating">("loading");
  const [query, setQuery] = useState("");
  const openPad = useFloatingNotepadStore((s) => s.openPad);

  useEffect(() => {
    let active = true;
    void fetch("/api/user/notes", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to fetch notes");
        return (await response.json()) as { notes?: Note[] };
      })
      .then((data) => {
        if (!active) return;
        setNotes(data.notes ?? []);
        setStatus("idle");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
  }, [notes, query]);

  async function createNote() {
    setStatus("creating");
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Note",
          content: serializeStagePadDocument(createStagePadDocument()),
        }),
      });
      if (!response.ok) throw new Error("Create failed");
      const note = (await response.json()) as Note;
      setNotes((current) => [note, ...current]);
      setStatus("idle");
      openPad(note.id);
    } catch {
      setStatus("error");
    }
  }

  return (
    <section
      data-testid="notes-library-panel"
      data-notes-role="library"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 12,
        minHeight: 280,
        color: "#fff",
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", color: "#FFD700" }}>
            NOTES LIBRARY
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            Open any note in the floating Notepad · media keeps playing
          </div>
        </div>
        <button
          type="button"
          data-testid="notes-library-create"
          onClick={() => void createNote()}
          disabled={status === "creating"}
          style={{
            minHeight: 36,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #00FFFF",
            background: "rgba(0,255,255,0.12)",
            color: "#00FFFF",
            fontWeight: 900,
            fontSize: 10,
            letterSpacing: "0.08em",
            cursor: "pointer",
          }}
        >
          + NEW NOTE
        </button>
      </header>

      <input
        data-testid="notes-library-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search notes…"
        style={{
          width: "100%",
          boxSizing: "border-box",
          minHeight: 40,
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.18)",
          background: "rgba(255,255,255,0.05)",
          color: "#fff",
          fontSize: 13,
        }}
      />

      <div role="status" style={{ fontSize: 11, color: status === "error" ? "#FF8A8A" : "rgba(255,255,255,0.4)" }}>
        {status === "loading"
          ? "Loading notes…"
          : status === "error"
            ? "Could not load notes"
            : status === "creating"
              ? "Creating…"
              : `${filtered.length} note${filtered.length === 1 ? "" : "s"}`}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, overflow: "auto", maxHeight: "min(48vh, 420px)" }}>
        {filtered.length === 0 && status === "idle" ? (
          <div
            data-testid="notes-library-empty"
            style={{
              padding: 20,
              borderRadius: 10,
              border: "1px dashed rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.5)",
              fontSize: 12,
              textAlign: "center",
            }}
          >
            No notes yet. Create one to open the floating Notepad.
          </div>
        ) : null}
        {filtered.map((note) => (
          <button
            key={note.id}
            type="button"
            data-testid={`notes-library-item-${note.id}`}
            onClick={() => openPad(note.id)}
            style={{
              textAlign: "left",
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,215,0,0.28)",
              background: "rgba(255,215,0,0.06)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.06em" }}>{note.title || "Untitled"}</div>
            <div
              style={{
                marginTop: 4,
                fontSize: 11,
                color: "rgba(255,255,255,0.45)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {note.content.replace(/\s+/g, " ").slice(0, 120) || "Empty note"}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect, useCallback, useTransition } from "react";

interface Note {
  id: string;
  title: string;
  content: string;
}

/**
 * NotesWorkspace — A simple, persistent notepad for the user.
 *
 * Allows users to jot down lyrics, ideas, or reminders.
 * Notes are fetched from and persisted to the database.
 */
export function NotesWorkspace() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "error" | "deleting">("loading");
  const [isPending, startTransition] = useTransition();

  const activeNote = notes.find(n => n.id === activeNoteId);

  useEffect(() => {
    const fetchNotes = async () => {
      setStatus("loading");
      try {
        const res = await fetch("/api/user/notes");
        if (!res.ok) throw new Error("Failed to fetch notes");
        const data = await res.json();
        const fetchedNotes = data.notes || [];
        setNotes(fetchedNotes);
        if (fetchedNotes.length > 0) {
          setActiveNoteId(fetchedNotes[0].id);
          setContent(fetchedNotes[0].content);
        }
        setStatus("idle");
      } catch {
        setStatus("error");
      }
    };
    void fetchNotes();
  }, []);

  const handleSave = useCallback(async () => {
    if (!activeNoteId) return;
    setStatus("saving");
    try {
      const res = await fetch("/api/user/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: activeNoteId, content }),
      });
      if (!res.ok) throw new Error("Failed to save");
      startTransition(() => {
        setNotes(notes.map(n => n.id === activeNoteId ? { ...n, content } : n));
        setStatus("idle");
      });
    } catch {
      setStatus("error");
    }
  }, [activeNoteId, content, notes]);

  const handleNewNote = useCallback(async () => {
    setStatus("saving");
    try {
      const res = await fetch(`/api/notes`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Note" }),
      });
      if (!res.ok) throw new Error("Failed to create note");
      const newNote = await res.json();
      startTransition(() => {
        setNotes(prev => [newNote, ...prev]);
        setActiveNoteId(newNote.id);
        setContent(newNote.content);
        setStatus("idle");
      });
    } catch { setStatus("error"); }
  }, []);

  const handleDelete = useCallback(async (noteId: string) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    setStatus("deleting");
    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete");
      startTransition(() => {
        const newNotes = notes.filter(n => n.id !== noteId);
        setNotes(newNotes);
        if (activeNoteId === noteId) {
          const nextNote = newNotes[0];
          setActiveNoteId(nextNote?.id ?? null);
          setContent(nextNote?.content ?? "");
        }
        setStatus("idle");
      });
    } catch {
      setStatus("error");
    }
  }, [notes, activeNoteId]);

  const getButtonText = () => {
    if (status === "saving") return "SAVING...";
    if (status === "deleting") return "DELETING...";
    if (status === "error") return "RETRY SAVE";
    return "SAVE NOTE";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.14em", color: "rgba(205, 229, 255, 0.9)", fontWeight: 800 }}>
          📝 MY NOTES
        </div>
        <div style={{display: 'flex', gap: 8}}>
          <button onClick={handleNewNote} disabled={status === 'saving' || status === 'deleting'} style={{background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.3)', color: '#9EFBFF', cursor: 'pointer', fontSize: 10, padding: '2px 8px', borderRadius: 4}}>
            + New Note
          </button>
          {activeNote && (
            <button onClick={() => handleDelete(activeNote.id)} disabled={status === 'deleting'} style={{background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff8888', cursor: 'pointer', fontSize: 10, padding: '2px 8px', borderRadius: 4}}>
              Delete
            </button>
          )}
        </div>
      </div>
      <textarea
        disabled={status === "loading" || !activeNoteId}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          status === "loading" ? "Loading notes..." :
          notes.length === 0 ? "Create your first note." :
          "Jot down lyrics, ideas, or reminders..."
        }
        style={{
          flex: 1,
          width: "100%",
          minHeight: 150,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 10,
          padding: "10px 12px",
          fontSize: 13,
          color: "#f4f1ff",
          outline: "none",
          resize: "none",
        }}
      />
      {/* Status Strip, per Build Director's "Calm UI" directive */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 8,
          padding: "4px 8px",
          background: "rgba(0,0,0,0.2)",
          borderRadius: 6,
        }}
      >
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
          {status === 'saving' && 'Saving...'}
          {status === 'idle' && 'Saved'}
          {status === 'error' && 'Error'}
        </span>
        <button
          type="button"
          onClick={handleSave}
          disabled={status === "saving" || status === "loading" || !activeNoteId}
          title="Save Note"
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 14 }}
        >
          {status === 'saving' ? '...' : '💾'}
        </button>
      </div>
    </div>
  );
}

export default NotesWorkspace;
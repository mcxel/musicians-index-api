"use client";

import { useState, useEffect, useCallback, useTransition, useRef, useMemo } from "react";

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
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "error" | "deleting">("loading");
  const [isPending, startTransition] = useTransition();

  const titleInputRef = useRef<HTMLInputElement>(null);
  const activeNote = notes.find(n => n.id === activeNoteId);

  const filteredNotes = useMemo(() => {
    if (!searchTerm) {
      return notes;
    }
    return notes.filter(note =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [notes, searchTerm]);

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
          // Auto-select the first note on initial load
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

  useEffect(() => {
    if (editingTitleId && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitleId]);

  const handleSave = useCallback(async () => {
    if (!activeNoteId) return;
    setStatus("saving");
    try {
      const res = await fetch("/api/user/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: activeNoteId, content, title: activeNote?.title }),
      });
      if (!res.ok) throw new Error("Failed to save");
      startTransition(() => {
        setNotes(notes.map(n => n.id === activeNoteId ? { ...n, content } : n));
        setStatus("idle");
      });
    } catch {
      setStatus("error");
    }
  }, [activeNoteId, content, notes, activeNote?.title]);

  const handleTitleChange = (noteId: string, newTitle: string) => {
    setNotes(notes.map(n => n.id === noteId ? { ...n, title: newTitle } : n));
  };

  const handleTitleBlur = useCallback(async (noteId: string) => {
    setEditingTitleId(null);
    const noteToSave = notes.find(n => n.id === noteId);
    if (!noteToSave) return;

    setStatus("saving");
    try {
      await fetch("/api/user/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: noteToSave.id, title: noteToSave.title }),
      });
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }, [notes]);

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
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 12, height: "100%" }}>
      {/* Note List Sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", color: "rgba(205, 229, 255, 0.9)", fontWeight: 800 }}>
            📝 MY NOTES
          </div>
          <button onClick={handleNewNote} disabled={isPending || status === 'saving' || status === 'deleting'} title="New Note" style={{background: 'transparent', border: 'none', color: '#9EFBFF', cursor: 'pointer', fontSize: 16, padding: '2px 4px'}}>
            +
          </button>
        </div>
        <input
          type="search"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6, padding: '4px 8px', color: 'white', fontSize: 11, marginBottom: 8
          }}
        />
        {filteredNotes.map(note => (
          <div key={note.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={() => { setActiveNoteId(note.id); setContent(note.content); }}
              onDoubleClick={() => setEditingTitleId(note.id)}
              style={{
                flex: 1,
                textAlign: 'left',
                padding: '6px 8px',
                fontSize: 12,
                borderRadius: 6,
                border: '1px solid transparent',
                background: activeNoteId === note.id ? 'rgba(0,255,255,0.1)' : 'transparent',
                borderColor: activeNoteId === note.id ? 'rgba(0,255,255,0.3)' : 'transparent',
                color: activeNoteId === note.id ? '#f4f1ff' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {editingTitleId === note.id ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={note.title}
                  onChange={(e) => handleTitleChange(note.id, e.target.value)}
                  onBlur={() => handleTitleBlur(note.id)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid #00FFFF', color: 'white', fontSize: 12, padding: 2 }}
                />
              ) : (
                note.title
              )}
            </button>
            <button onClick={() => handleDelete(note.id)} disabled={isPending || status === 'deleting'} title="Delete Note" style={{ background: 'transparent', border: 'none', color: 'rgba(255,100,100,0.5)', cursor: 'pointer', fontSize: 10 }}>
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Editor Pane */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <textarea
          disabled={status === "loading" || !activeNoteId}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            status === "loading" ? "Loading notes..." :
            notes.length === 0 ? "Create your first note to start writing." :
            "Jot down lyrics, ideas, or reminders..."
          }
          style={{
            flex: 1,
            width: "100%",
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, padding: "4px 0" }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
            {status === 'saving' ? 'Saving...' : status === 'idle' ? 'Saved' : status === 'error' ? 'Error saving' : ''}
          </span>
          <button type="button" onClick={handleSave} disabled={isPending || status === "saving" || status === "loading" || !activeNoteId} title="Save Note" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 14 }}>
            {isPending || status === 'saving' ? '...' : '💾'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotesWorkspace;
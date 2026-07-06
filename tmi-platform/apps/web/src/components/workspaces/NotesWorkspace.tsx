"use client";

import { useState } from "react";

/**
 * NotesWorkspace — A simple, persistent notepad for the user.
 *
 * Allows users to jot down lyrics, ideas, or reminders.
 * The "Save" action is currently a placeholder; in a full implementation,
 * this would persist to a user's profile data via an API call.
 */
export function NotesWorkspace() {
  const [content, setContent] = useState("");

  const handleSave = () => {
    // In a real implementation, this would call an API endpoint.
    // e.g., fetch('/api/user/notes', { method: 'POST', body: JSON.stringify({ content }) });
    console.log("Saving note:", content);
    alert("Note saved! (Check console for output)");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.14em", color: "rgba(205, 229, 255, 0.9)", fontWeight: 800 }}>
        📝 MY NOTES
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Jot down lyrics, ideas, or reminders..."
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
      <button type="button" onClick={handleSave} style={{ background: "#00C8FF", color: "#050510", border: "none", padding: "10px 16px", fontSize: 12, fontWeight: 900, cursor: "pointer", borderRadius: 8, letterSpacing: "0.05em" }}>
        SAVE NOTE
      </button>
    </div>
  );
}

export default NotesWorkspace;
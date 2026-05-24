"use client";
import { useState } from "react";

interface Template {
  id: string;
  venue: string;
  capacity: number;
  sections: string[];
  color: string;
  lastUsed: string;
}

const SEED: Template[] = [
  { id: "vtt1", venue: "World Stage", capacity: 5000, sections: ["FLOOR GA", "SECTION A", "SECTION B", "VIP FLOOR", "VIP BALCONY"], color: "#FF2DAA", lastUsed: "Apr 20, 2026" },
  { id: "vtt2", venue: "Cypher Arena", capacity: 800, sections: ["FLOOR GA", "CYPHER PIT", "BLEACHERS", "VIP RING"], color: "#AA2DFF", lastUsed: "Apr 25, 2026" },
  { id: "vtt3", venue: "Battle Ring", capacity: 400, sections: ["FRONT ROW", "BLEACHERS", "VIP CAGE"], color: "#FFD700", lastUsed: "Apr 22, 2026" },
  { id: "vtt4", venue: "Bar Stage", capacity: 200, sections: ["STANDING", "BAR SEATING", "BOOTH VIP"], color: "#00FF88", lastUsed: "Apr 18, 2026" },
  { id: "vtt5", venue: "Concert Hall 1", capacity: 1200, sections: ["FLOOR", "MEZZANINE", "BALCONY", "VIP BOX"], color: "#00FFFF", lastUsed: "Mar 30, 2026" },
];

const PALETTE = ["#FF2DAA", "#AA2DFF", "#FFD700", "#00FF88", "#00FFFF", "#FF8C00", "#FF4444"];

const blank = (): Omit<Template, "id"> => ({
  venue: "", capacity: 100, sections: [], color: "#00FFFF", lastUsed: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
});

export default function AdminVenueTicketTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(SEED);
  const [editing, setEditing] = useState<Template | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Omit<Template, "id">>(blank());
  const [sectionInput, setSectionInput] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  function openEdit(t: Template) {
    setEditing(t);
    setDraft({ venue: t.venue, capacity: t.capacity, sections: [...t.sections], color: t.color, lastUsed: t.lastUsed });
    setSectionInput("");
    setCreating(false);
  }

  function openCreate() {
    setDraft(blank());
    setSectionInput("");
    setCreating(true);
    setEditing(null);
  }

  function closePanel() {
    setEditing(null);
    setCreating(false);
  }

  function addSection() {
    const s = sectionInput.trim().toUpperCase();
    if (s && !draft.sections.includes(s)) {
      setDraft(d => ({ ...d, sections: [...d.sections, s] }));
    }
    setSectionInput("");
  }

  function removeSection(s: string) {
    setDraft(d => ({ ...d, sections: d.sections.filter(x => x !== s) }));
  }

  function saveEdit() {
    if (!editing) return;
    setTemplates(ts => ts.map(t => t.id === editing.id ? { ...t, ...draft } : t));
    flash(editing.id);
    closePanel();
  }

  function saveCreate() {
    if (!draft.venue.trim()) return;
    const id = `vtt-${Date.now()}`;
    setTemplates(ts => [{ id, ...draft }, ...ts]);
    flash(id);
    closePanel();
  }

  function deleteTemplate(id: string) {
    setTemplates(ts => ts.filter(t => t.id !== id));
    if (editing?.id === id) closePanel();
  }

  function flash(id: string) {
    setSaved(id);
    setTimeout(() => setSaved(null), 1800);
  }

  const panelOpen = editing !== null || creating;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#FF2DAA", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Venue Ticket Templates</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Configure section layouts and capacity per venue. Used when generating event tickets.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16, marginBottom: 40 }}>
          {templates.map(t => (
            <div key={t.id} style={{ background: saved === t.id ? "rgba(0,255,136,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${t.color}${saved === t.id ? "80" : "20"}`, borderRadius: 12, padding: 20, transition: "all 0.4s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 9, color: t.color, fontWeight: 800, letterSpacing: "0.12em", marginBottom: 4 }}>{t.venue.toUpperCase()}</div>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{t.capacity.toLocaleString()} cap</div>
                </div>
                <button onClick={() => openEdit(t)} style={{ padding: "5px 12px", fontSize: 8, fontWeight: 800, color: t.color, border: `1px solid ${t.color}40`, borderRadius: 6, background: "transparent", cursor: "pointer" }}>EDIT</button>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 8 }}>SECTIONS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {t.sections.map(s => (
                    <span key={s} style={{ fontSize: 9, padding: "3px 8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, color: "rgba(255,255,255,0.6)" }}>{s}</span>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>Last used: {t.lastUsed}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={openCreate} style={{ padding: "10px 20px", fontSize: 10, fontWeight: 800, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, background: "transparent", cursor: "pointer" }}>+ NEW VENUE TEMPLATE</button>
        </div>
      </div>

      {panelOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={closePanel}>
          <div style={{ background: "#0a0a1a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 32, width: "min(520px, 94vw)", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 9, color: "#00FFFF", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 16 }}>{creating ? "NEW VENUE TEMPLATE" : `EDIT — ${editing?.venue.toUpperCase()}`}</div>

            <label style={{ display: "block", marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 6 }}>VENUE NAME</div>
              <input value={draft.venue} onChange={e => setDraft(d => ({ ...d, venue: e.target.value }))} placeholder="e.g. World Stage" style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "#fff", fontSize: 13, boxSizing: "border-box" }} />
            </label>

            <label style={{ display: "block", marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 6 }}>CAPACITY</div>
              <input type="number" value={draft.capacity} onChange={e => setDraft(d => ({ ...d, capacity: parseInt(e.target.value) || 0 }))} style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "#fff", fontSize: 13, boxSizing: "border-box" }} />
            </label>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 8 }}>ACCENT COLOR</div>
              <div style={{ display: "flex", gap: 8 }}>
                {PALETTE.map(c => (
                  <button key={c} onClick={() => setDraft(d => ({ ...d, color: c }))} style={{ width: 28, height: 28, borderRadius: 6, background: c, border: draft.color === c ? "2px solid #fff" : "2px solid transparent", cursor: "pointer" }} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 8 }}>SECTIONS</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input value={sectionInput} onChange={e => setSectionInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addSection()} placeholder="e.g. VIP BOX" style={{ flex: 1, padding: "7px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "#fff", fontSize: 12 }} />
                <button onClick={addSection} style={{ padding: "7px 14px", fontSize: 10, fontWeight: 800, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 6, background: "transparent", cursor: "pointer" }}>ADD</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {draft.sections.map(s => (
                  <span key={s} style={{ fontSize: 9, padding: "4px 8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 6 }}>
                    {s}
                    <button onClick={() => removeSection(s)} style={{ background: "none", border: "none", color: "#FF2DAA", cursor: "pointer", fontSize: 11, padding: 0, lineHeight: 1 }}>×</button>
                  </span>
                ))}
                {draft.sections.length === 0 && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>No sections yet — add one above</span>}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 24 }}>
              {editing && (
                <button onClick={() => deleteTemplate(editing.id)} style={{ padding: "9px 16px", fontSize: 9, fontWeight: 800, color: "#FF4444", border: "1px solid rgba(255,68,68,0.3)", borderRadius: 6, background: "transparent", cursor: "pointer" }}>DELETE</button>
              )}
              <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
                <button onClick={closePanel} style={{ padding: "9px 20px", fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "transparent", cursor: "pointer" }}>CANCEL</button>
                <button onClick={creating ? saveCreate : saveEdit} disabled={!draft.venue.trim()} style={{ padding: "9px 20px", fontSize: 9, fontWeight: 800, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.4)", borderRadius: 6, background: "rgba(0,255,255,0.08)", cursor: draft.venue.trim() ? "pointer" : "not-allowed", opacity: draft.venue.trim() ? 1 : 0.4 }}>{creating ? "CREATE" : "SAVE CHANGES"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

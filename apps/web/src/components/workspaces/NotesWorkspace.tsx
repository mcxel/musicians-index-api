"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createStagePadDocument,
  parseStagePadDocument,
  serializeStagePadDocument,
  type StagePadDocument,
  type StagePadPoint,
  type StagePadStroke,
} from "@/lib/notes/stagePadDocument";

interface Note {
  id: string;
  title: string;
  content: string;
}

type ToolMode = "pen" | "eraser" | "text" | "hand";

const INK_COLORS = [
  { label: "Black", value: "#171717" },
  { label: "Blue", value: "#1769d2" },
  { label: "Red", value: "#d62f35" },
  { label: "Green", value: "#23834a" },
  { label: "Gold", value: "#c58a00" },
  { label: "White", value: "#ffffff" },
];
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1400;

function drawStrokes(canvas: HTMLCanvasElement, strokes: StagePadStroke[]) {
  const context = canvas.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  context.lineCap = "round";
  context.lineJoin = "round";
  for (const stroke of strokes) {
    if (stroke.points.length === 0) continue;
    context.strokeStyle = stroke.color;
    context.fillStyle = stroke.color;
    context.lineWidth = stroke.width;
    if (stroke.points.length === 1) {
      const point = stroke.points[0];
      context.beginPath();
      context.arc(point.x * CANVAS_WIDTH, point.y * CANVAS_HEIGHT, stroke.width / 2, 0, Math.PI * 2);
      context.fill();
      continue;
    }
    for (let index = 1; index < stroke.points.length; index += 1) {
      const previous = stroke.points[index - 1];
      const point = stroke.points[index];
      context.lineWidth = point.pressure && point.pressure > 0 ? stroke.width * (0.55 + point.pressure * 0.9) : stroke.width;
      context.beginPath();
      context.moveTo(previous.x * CANVAS_WIDTH, previous.y * CANVAS_HEIGHT);
      context.lineTo(point.x * CANVAS_WIDTH, point.y * CANVAS_HEIGHT);
      context.stroke();
    }
  }
}

function pointDistance(left: StagePadPoint, right: StagePadPoint) {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

export function NotesWorkspace() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [document, setDocument] = useState<StagePadDocument>(createStagePadDocument);
  const [pageIndex, setPageIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "error" | "deleting">("loading");
  const [mode, setMode] = useState<ToolMode>("text");
  const [shelfOpen, setShelfOpen] = useState(false);
  const [inkColor, setInkColor] = useState("#171717");
  const [inkWidth, setInkWidth] = useState(4);
  const [penBody, setPenBody] = useState("gold");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeStrokeRef = useRef<StagePadStroke | null>(null);
  const undoRef = useRef(new Map<number, StagePadStroke[][]>());
  const redoRef = useRef(new Map<number, StagePadStroke[][]>());
  const pushUndo = (index: number, strokes: StagePadStroke[]) => {
    const history = undoRef.current.get(index) ?? [];
    history.push(strokes);
    undoRef.current.set(index, history);
    redoRef.current.set(index, []);
  };
  const currentPage = document.pages[pageIndex];

  useEffect(() => {
    undoRef.current.clear();
    redoRef.current.clear();
  }, [activeNoteId]);

  useEffect(() => {
    let active = true;
    void fetch("/api/user/notes", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to fetch notes");
        return await response.json() as { notes?: Note[] };
      })
      .then((data) => {
        if (!active) return;
        const fetchedNotes = data.notes ?? [];
        setNotes(fetchedNotes);
        if (fetchedNotes.length > 0) {
          setActiveNoteId(fetchedNotes[0].id);
          setDocument(parseStagePadDocument(fetchedNotes[0].content));
        }
        setStatus("idle");
      })
      .catch(() => { if (active) setStatus("error"); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) drawStrokes(canvas, currentPage.strokes);
  }, [currentPage.strokes, pageIndex]);

  const updatePage = useCallback((updater: (page: StagePadDocument["pages"][number]) => StagePadDocument["pages"][number]) => {
    setDocument((current) => ({ ...current, pages: current.pages.map((page, index) => index === pageIndex ? updater(page) : page) }));
  }, [pageIndex]);

  const handleSave = useCallback(async () => {
    if (!activeNoteId) return;
    setStatus("saving");
    const content = serializeStagePadDocument(document);
    try {
      const response = await fetch("/api/user/notes", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: activeNoteId, content }),
      });
      if (!response.ok) throw new Error("Save failed");
      setNotes((current) => current.map((note) => note.id === activeNoteId ? { ...note, content } : note));
      setStatus("idle");
    } catch { setStatus("error"); }
  }, [activeNoteId, document]);

  const handleNewNote = useCallback(async () => {
    setStatus("saving");
    try {
      const response = await fetch("/api/notes", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Note", content: serializeStagePadDocument(createStagePadDocument()) }),
      });
      if (!response.ok) throw new Error("Create failed");
      const note = await response.json() as Note;
      setNotes((current) => [note, ...current]);
      setActiveNoteId(note.id);
      setDocument(parseStagePadDocument(note.content));
      setPageIndex(0);
      setStatus("idle");
    } catch { setStatus("error"); }
  }, []);

  const handleDelete = useCallback(async () => {
    if (!activeNoteId || !window.confirm("Delete this note?")) return;
    setStatus("deleting");
    try {
      const response = await fetch(`/api/notes/${activeNoteId}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error("Delete failed");
      const remaining = notes.filter((note) => note.id !== activeNoteId);
      setNotes(remaining);
      setActiveNoteId(remaining[0]?.id ?? null);
      setDocument(remaining[0] ? parseStagePadDocument(remaining[0].content) : createStagePadDocument());
      setPageIndex(0);
      setStatus("idle");
    } catch { setStatus("error"); }
  }, [activeNoteId, notes]);

  const normalizedPoint = (event: React.PointerEvent<HTMLCanvasElement>): StagePadPoint => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
      y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)),
      ...(event.pressure > 0 ? { pressure: event.pressure } : {}),
    };
  };
  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode === "text" || mode === "hand" || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    if (mode === "eraser") {
      pushUndo(pageIndex, currentPage.strokes);
      const point = normalizedPoint(event);
      updatePage((page) => ({ ...page, strokes: page.strokes.filter((stroke) => !stroke.points.some((candidate) => pointDistance(candidate, point) < 0.035)) }));
      return;
    }
    pushUndo(pageIndex, currentPage.strokes);
    activeStrokeRef.current = { color: inkColor, width: inkWidth, tool: "pen", points: [normalizedPoint(event)] };
    updatePage((page) => ({ ...page, strokes: [...page.strokes, activeStrokeRef.current!] }));
  };
  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const point = normalizedPoint(event);
    if (mode === "eraser") {
      updatePage((page) => ({ ...page, strokes: page.strokes.filter((stroke) => !stroke.points.some((candidate) => pointDistance(candidate, point) < 0.035)) }));
      return;
    }
    const stroke = activeStrokeRef.current;
    if (!stroke) return;
    stroke.points.push(point);
    updatePage((page) => ({ ...page, strokes: [...page.strokes.slice(0, -1), stroke] }));
  };
  const finishPointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    activeStrokeRef.current = null;
  };
  const undo = () => {
    const previous = undoRef.current.get(pageIndex)?.pop();
    if (!previous) return;
    const redoHistory = redoRef.current.get(pageIndex) ?? [];
    redoHistory.push(currentPage.strokes);
    redoRef.current.set(pageIndex, redoHistory);
    updatePage((page) => ({ ...page, strokes: previous }));
  };
  const redo = () => {
    const next = redoRef.current.get(pageIndex)?.pop();
    if (!next) return;
    const undoHistory = undoRef.current.get(pageIndex) ?? [];
    undoHistory.push(currentPage.strokes);
    undoRef.current.set(pageIndex, undoHistory);
    updatePage((page) => ({ ...page, strokes: next }));
  };
  const buttonStyle = (selected = false) => ({
    minHeight: 36, padding: "6px 10px", borderRadius: 5,
    border: `1px solid ${selected ? "#12b8b0" : "rgba(0,0,0,0.18)"}`,
    background: selected ? "#dff8f3" : "rgba(255,255,255,0.78)",
    color: "#17332f", fontSize: 11, fontWeight: 800, cursor: "pointer",
  } as const);

  return (
    <section data-stage-pad="1" style={{ display: "flex", flexDirection: "column", gap: 10, height: "100%", minHeight: 0, color: "#21302c" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.12em", fontWeight: 900 }}>STAGE PAD</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" onClick={() => void handleNewNote()} disabled={status === "saving"} style={buttonStyle()}>+ NOTE</button>
          {activeNoteId ? <button type="button" onClick={() => void handleDelete()} disabled={status === "deleting"} style={buttonStyle()}>DELETE</button> : null}
        </div>
      </header>
      <nav aria-label="Stage Pad sheets" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {document.pages.map((_, index) => <button key={index} type="button" aria-current={pageIndex === index ? "page" : undefined} onClick={() => setPageIndex(index)} style={buttonStyle(pageIndex === index)}>SHEET {index + 1}</button>)}
        <div aria-label="Paper style" style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          {([
            { paper: "ruled" as const, label: "Yellow lined paper", color: "#fff0a3" },
            { paper: "blank" as const, label: "White blank paper", color: "#ffffff" },
          ]).map((option) => {
            const selected = currentPage.paper === option.paper;
            return <button key={option.paper} type="button" aria-label={option.label} aria-pressed={selected} title={option.label} onClick={() => updatePage((page) => ({ ...page, paper: option.paper }))} style={{ width: 38, height: 38, borderRadius: "50%", border: selected ? "3px solid #12a69d" : "2px solid #59635f", background: option.color, boxShadow: selected ? "0 0 0 2px white, 0 0 0 4px #12a69d" : "none", cursor: "pointer", position: "relative" }}>
              {selected ? <span aria-hidden="true" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#153a35", fontWeight: 900 }}>✓</span> : null}
            </button>;
          })}
        </div>
      </nav>
      <div style={{ position: "relative", flex: 1, minHeight: 440, overflow: "auto", border: "1px solid rgba(53,55,47,0.25)", borderRadius: 4, boxShadow: "0 4px 12px rgba(0,0,0,0.12)" }}>
        <div data-stage-pad-paper={currentPage.paper} style={{ position: "relative", width: "100%", minHeight: 560, aspectRatio: "5 / 7", backgroundColor: currentPage.paper === "ruled" ? "#fff2a8" : "#ffffff", backgroundImage: currentPage.paper === "ruled" ? "linear-gradient(to right, transparent 56px, rgba(196,47,53,0.62) 57px, transparent 58px), repeating-linear-gradient(to bottom, transparent 0, transparent 31px, rgba(52,121,170,0.24) 32px, transparent 33px)" : undefined, backgroundPosition: "0 0", backgroundSize: "100% 100%, 100% 33px" }}>
          <textarea aria-label={`Stage Pad sheet ${pageIndex + 1} text`} value={currentPage.text} onChange={(event) => updatePage((page) => ({ ...page, text: event.target.value }))} placeholder="Type rhymes, notes, names, or scores…" spellCheck style={{ position: "absolute", zIndex: 1, inset: 0, width: "100%", height: "100%", minHeight: 560, boxSizing: "border-box", resize: "none", border: 0, outline: 0, padding: currentPage.paper === "ruled" ? "16px 18px 24px 70px" : "22px 24px", background: "transparent", color: "#20241f", font: "16px/33px Georgia, serif", whiteSpace: "pre-wrap" }} />
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} aria-label={`Drawing layer, ${mode} mode`} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={finishPointer} onPointerCancel={finishPointer} style={{ position: "absolute", zIndex: mode === "pen" || mode === "eraser" ? 2 : 0, inset: 0, width: "100%", height: "100%", pointerEvents: mode === "pen" || mode === "eraser" ? "auto" : "none", touchAction: mode === "pen" || mode === "eraser" ? "none" : "auto", cursor: mode === "pen" ? "crosshair" : mode === "eraser" ? "cell" : "text" }} />
        </div>
        <button type="button" aria-expanded={shelfOpen} aria-controls="stage-pad-pen-shelf" onClick={() => setShelfOpen((open) => !open)} style={{ position: "sticky", float: "right", top: 10, right: 8, zIndex: 5, minHeight: 40, border: "1px solid #4b5b53", borderRadius: "8px 0 0 8px", background: "#f8fbf6", color: "#1c3029", padding: "8px 10px", fontWeight: 900, cursor: "pointer" }}>PEN {shelfOpen ? "›" : "‹"}</button>
        {shelfOpen ? <aside id="stage-pad-pen-shelf" aria-label="Pen and drawing tools" style={{ position: "sticky", float: "right", clear: "right", top: 58, zIndex: 5, width: 190, padding: 10, marginRight: 8, border: "1px solid #6d766e", borderRadius: 6, background: "rgba(255,255,255,0.96)", boxShadow: "0 5px 18px rgba(0,0,0,0.18)" }}>
          <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
            {(["pen", "eraser", "text", "hand"] as const).map((tool) => <button key={tool} type="button" aria-pressed={mode === tool} onClick={() => setMode(tool)} style={{ ...buttonStyle(mode === tool), minWidth: 0, padding: "5px 7px", textTransform: "uppercase" }}>{tool === "hand" ? "HAND" : tool}</button>)}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: 9 }}>
            {INK_COLORS.map((color) => <button key={color.value} type="button" aria-label={`${color.label} ink`} aria-pressed={inkColor === color.value} title={`${color.label} ink`} onClick={() => { setInkColor(color.value); setMode("pen"); setShelfOpen(false); }} style={{ width: 30, height: 30, borderRadius: "50%", border: inkColor === color.value ? "3px solid #12a69d" : "1px solid #59635f", background: color.value, boxShadow: inkColor === color.value ? "0 0 0 2px white, 0 0 0 4px #12a69d" : "none", cursor: "pointer" }} />)}
            <label aria-label="Custom ink color" title="Custom ink color" style={{ width: 30, height: 30, borderRadius: "50%", overflow: "hidden", border: "1px solid #59635f", cursor: "pointer" }}><input type="color" value={inkColor} onChange={(event) => { setInkColor(event.target.value); setMode("pen"); setShelfOpen(false); }} style={{ width: 40, height: 40, transform: "translate(-5px, -5px)", cursor: "pointer" }} /></label>
          </div>
          <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 11, marginBottom: 8 }}>SIZE<select aria-label="Pen size" value={inkWidth} onChange={(event) => setInkWidth(Number(event.target.value))}><option value={2}>Thin</option><option value={4}>Medium</option><option value={8}>Thick</option></select></label>
          <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 11, marginBottom: 8 }}>PEN BODY<select aria-label="Pen appearance" value={penBody} onChange={(event) => setPenBody(event.target.value)}><option value="gold">Gold</option><option value="blue">Blue</option><option value="graphite">Graphite</option></select></label>
          <div style={{ display: "flex", gap: 5 }}><button type="button" onClick={undo} style={buttonStyle()}>UNDO</button><button type="button" onClick={redo} style={buttonStyle()}>REDO</button><button type="button" onClick={() => { pushUndo(pageIndex, currentPage.strokes); updatePage((page) => ({ ...page, strokes: [] })); }} style={buttonStyle()}>CLEAR</button></div>
          <span data-equipped-pen-body={penBody} style={{ display: "block", marginTop: 7, fontSize: 9, color: "#59635f" }}>Pen body and ink color are independent.</span>
        </aside> : null}
      </div>
      <footer style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span role={status === "error" ? "alert" : "status"} style={{ fontSize: 11, color: status === "error" ? "#a12626" : "#56615b" }}>{status === "saving" ? "Saving…" : status === "error" ? "Could not save" : status === "loading" ? "Loading…" : "Saved"}</span>
        <button type="button" onClick={() => void handleSave()} disabled={!activeNoteId || status === "saving" || status === "loading"} style={buttonStyle()}>{status === "saving" ? "SAVING…" : "SAVE NOTE"}</button>
      </footer>
    </section>
  );
}

export default NotesWorkspace;
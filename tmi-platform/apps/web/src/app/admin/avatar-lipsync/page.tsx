import Link from "next/link";
import {
  getDailyLipSyncBoard,
  getLipSyncDirective,
  getPhonemeFrame,
  type LipSyncMode,
  type PhonemeGroup,
} from "@/lib/avatar/AvatarLipSyncDirectiveEngine";

const ALL_MODES: LipSyncMode[] = ["singing", "rapping", "talking", "hype-call", "whisper", "mouthing"];

const ALL_PHONEMES: PhonemeGroup[] = [
  "bilabial", "labiodental", "dental", "alveolar", "velar",
  "vowel-open", "vowel-mid", "vowel-close", "vowel-round", "rest",
];

const MODE_COLORS: Record<LipSyncMode, string> = {
  singing:    "#FF2DAA",
  rapping:    "#FFD700",
  talking:    "#00FFFF",
  "hype-call": "#00FF88",
  whisper:    "#AA2DFF",
  mouthing:   "#FF8C00",
};

const INTENSITY_COLORS = { low: "#00FFFF", medium: "#FFD700", high: "#FF2DAA" };

export default function AvatarLipSyncPage() {
  const board = getDailyLipSyncBoard();
  const activeDirective = getLipSyncDirective(board.activeMode);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "30px 20px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Link href="/admin/directives" style={{ color: "#FFD700", textDecoration: "none", fontSize: 12 }}>← Directives</Link>
        <h1 style={{ fontSize: 32, margin: "14px 0 6px", fontWeight: 700 }}>Avatar Lip Sync Directives</h1>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
          Phoneme sequencing and mouth animation directives for {board.date}.
        </div>

        <div style={{ border: `1px solid ${MODE_COLORS[board.activeMode]}55`, borderRadius: 14, padding: "20px 22px", background: `${MODE_COLORS[board.activeMode]}08`, marginBottom: 28 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
            Active Mode Today
          </div>
          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: MODE_COLORS[board.activeMode] }}>{board.activeMode}</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>BPM</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{board.bpm}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Intensity</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: INTENSITY_COLORS[board.intensity] }}>{board.intensity}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Syllables/Beat</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{activeDirective.syllablesPerBeat}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Frame Duration</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{activeDirective.frameDurationMs}ms</div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Phoneme Sequence</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {activeDirective.phonemeSequence.map((p, i) => (
                <span key={i} style={{ fontSize: 11, color: MODE_COLORS[board.activeMode], background: `${MODE_COLORS[board.activeMode]}22`, borderRadius: 5, padding: "3px 8px" }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: "rgba(255,255,255,0.8)" }}>
          All Lip Sync Modes
        </h2>
        <div style={{ display: "grid", gap: 8, marginBottom: 30 }}>
          {ALL_MODES.map(mode => {
            const d = getLipSyncDirective(mode);
            return (
              <div key={mode} style={{ border: `1px solid ${MODE_COLORS[mode]}33`, borderRadius: 10, padding: "10px 14px", background: mode === board.activeMode ? `${MODE_COLORS[mode]}10` : "rgba(255,255,255,0.02)", display: "grid", gridTemplateColumns: "120px 60px 70px 100px 1fr", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: mode === board.activeMode ? 700 : 400, color: mode === board.activeMode ? MODE_COLORS[mode] : "#fff" }}>
                  {mode}{mode === board.activeMode ? " ◀" : ""}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{d.bpm} bpm</div>
                <div style={{ fontSize: 11, color: INTENSITY_COLORS[d.intensity] }}>{d.intensity}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{d.frameDurationMs}ms/frame</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {d.phonemeSequence.slice(0, 4).map((p, i) => (
                    <span key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)", borderRadius: 4, padding: "2px 6px" }}>{p}</span>
                  ))}
                  {d.phonemeSequence.length > 4 && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>+{d.phonemeSequence.length - 4}</span>}
                </div>
              </div>
            );
          })}
        </div>

        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: "rgba(255,255,255,0.8)" }}>
          Phoneme Frame Reference
        </h2>
        <div style={{ display: "grid", gap: 8 }}>
          {ALL_PHONEMES.map(phoneme => {
            const frame = getPhonemeFrame(phoneme);
            return (
              <div key={phoneme} style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 14px", background: "rgba(255,255,255,0.02)", display: "grid", gridTemplateColumns: "120px 90px 90px 90px 80px", gap: 10, alignItems: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{phoneme}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>open: {frame.mouthOpenPct}%</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>round: {frame.lipRoundPct}%</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>teeth: {frame.teethVisiblePct}%</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{frame.durationMs}ms</div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

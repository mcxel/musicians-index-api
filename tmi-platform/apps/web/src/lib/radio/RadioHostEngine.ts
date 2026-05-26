import { HostSpeechQueueEngine } from "@/lib/hosts/HostSpeechQueueEngine";
import { hostVoicePersonalityEngine } from "@/lib/hosts/HostVoicePersonalityEngine";
import type { SpeechContext } from "@/lib/hosts/HostVoicePersonalityEngine";

export interface RadioLine {
  djId: string;
  djName: string;
  emoji: string;
  color: string;
  text: string;
  context: SpeechContext;
  ts: number;
}

const DJS = [
  { id: "dj-nova",  name: "DJ NOVA",  emoji: "🎙️", personality: "hype"    as const, color: "#FF2DAA" },
  { id: "wavetech", name: "WAVETEK",  emoji: "🎧", personality: "smooth"  as const, color: "#00C8FF" },
  { id: "analyst",  name: "ANALYST",  emoji: "🧠", personality: "serious" as const, color: "#AA2DFF" },
  { id: "comic",    name: "COMIC",    emoji: "😂", personality: "funny"   as const, color: "#FFD700" },
] as const;

// Assign personalities on module load
for (const dj of DJS) {
  hostVoicePersonalityEngine.assignPersonality(dj.id, dj.personality);
}

// Radio context rotation — keeps flow feeling natural
const CONTEXT_ROTATION: SpeechContext[] = [
  "radio-song-intro",
  "radio-stay-locked",
  "radio-reaction-comment",
  "radio-drop-tease",
  "radio-song-intro",
  "radio-stay-locked",
];

let rotationIdx = 0;
let loopTimer: ReturnType<typeof setTimeout> | null = null;
let _callback: ((line: RadioLine) => void) | null = null;

function nextDelay(): number {
  return 45_000 + Math.random() * 45_000; // 45–90s
}

function pickDJ() {
  return DJS[Math.floor(Math.random() * DJS.length)]!;
}

function fireNextLine() {
  if (!_callback) return;

  const context = CONTEXT_ROTATION[rotationIdx % CONTEXT_ROTATION.length] as SpeechContext;
  rotationIdx++;

  const dj = pickDJ();
  const speechLine = hostVoicePersonalityEngine.generateLine(dj.id, context);

  const line: RadioLine = {
    djId:    dj.id,
    djName:  dj.name,
    emoji:   dj.emoji,
    color:   dj.color,
    text:    speechLine.text,
    context,
    ts:      Date.now(),
  };

  // Enqueue so the host engine tracks it
  HostSpeechQueueEngine.enqueue(dj.id, line.text, "normal");

  _callback(line);
  scheduleNext();
}

function scheduleNext() {
  loopTimer = setTimeout(fireNextLine, nextDelay());
}

export const RadioHostEngine = {
  start(onLine: (line: RadioLine) => void): void {
    _callback = onLine;
    if (loopTimer) return;
    scheduleNext();
  },

  stop(): void {
    if (loopTimer) clearTimeout(loopTimer);
    loopTimer = null;
    _callback = null;
  },

  // Fire immediately for drop/game events — uses urgent priority
  pushUrgent(context: SpeechContext, vars?: Record<string, string>): RadioLine | null {
    const dj = DJS[0]!; // DJ Nova for urgent announcements
    const speechLine = hostVoicePersonalityEngine.generateLine(dj.id, context, vars);
    const line: RadioLine = {
      djId: dj.id, djName: dj.name, emoji: dj.emoji, color: dj.color,
      text: speechLine.text, context, ts: Date.now(),
    };
    HostSpeechQueueEngine.enqueue(dj.id, line.text, "urgent");
    if (_callback) _callback(line);
    return line;
  },

  generateLine(context: SpeechContext, vars?: Record<string, string>): RadioLine {
    const dj = pickDJ();
    const speechLine = hostVoicePersonalityEngine.generateLine(dj.id, context, vars ?? {});
    return {
      djId: dj.id, djName: dj.name, emoji: dj.emoji, color: dj.color,
      text: speechLine.text, context, ts: Date.now(),
    };
  },
};

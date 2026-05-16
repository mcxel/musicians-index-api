/**
 * BotDripEmitter.ts — Ghost Force V1
 *
 * Controlled drip-feed of confidence bots into a live room.
 * Max 3 bots per room. First entry: 30-60s. Subsequent: 45-90s.
 * Bots deliver confidence sparks and passive hype only.
 * No learning loop, no auto-repair, no prop tracking.
 */

const GHOST_BOT_NAMES = ["Jay", "Nova", "Rico", "Luna", "Ace", "Kreach", "Zuri", "Dex"];

const ARRIVAL_LINES = [
  "just pulled up 👀",
  "in here for the vibes 🔥",
  "heard this was the spot tonight 🎵",
  "came through — let's go",
  "🙌 made it in time",
  "yo everyone 🤙 what's good",
];

const CONFIDENCE_LINES = [
  "yo this is hard fr 🔥",
  "we all came for this 💯",
  "room is feeling it rn 🙌",
  "let them cook 🔥",
  "this the vibe right here 💎",
  "i see you 👀 keep going",
  "the energy in here is different tonight",
  "fr fr this one hits different",
  "stage is alive rn 🎤",
  "not leaving til this is over 🔒",
];

const PASSIVE_CHAT_LINES = [
  "📊 vibes still high",
  "crowd active fr",
  "🎵 locked in",
  "this room goes hard ngl",
  "stay up 🔥",
  "💯 consistent",
];

export type GhostBotCallbacks = {
  onChat: (botName: string, text: string) => void;
  onHype: (botName: string) => void;
  onTip: (botName: string) => void;
  onDiag: (msg: string) => void;
};

function rand(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function startGhostForceV1(
  roomId: string,
  callbacks: GhostBotCallbacks
): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];
  let botCount = 0;
  const MAX_BOTS = 3;
  const activeNames: string[] = [];

  function scheduleArrival(delayMs: number): void {
    if (botCount >= MAX_BOTS) return;

    const t = setTimeout(() => {
      botCount++;
      const available = GHOST_BOT_NAMES.filter((n) => !activeNames.includes(n));
      if (available.length === 0) return;

      const name = pick(available);
      activeNames.push(name);

      callbacks.onChat(name, pick(ARRIVAL_LINES));
      callbacks.onDiag(
        `[GhostForce V1] ${name} entered ${roomId} (${botCount}/${MAX_BOTS})`
      );

      // Confidence spark 25-40s after arrival
      const confT = setTimeout(() => {
        callbacks.onChat(name, pick(CONFIDENCE_LINES));
        callbacks.onHype(name);
      }, rand(25000, 40000));
      timers.push(confT);

      // Passive chat loop — every 60-90s while in room (2-3 times max)
      let passiveCount = 0;
      const MAX_PASSIVE = 2 + Math.floor(Math.random() * 2);
      const passiveTick = () => {
        if (passiveCount >= MAX_PASSIVE) return;
        passiveCount++;
        const pT = setTimeout(() => {
          callbacks.onChat(name, pick(PASSIVE_CHAT_LINES));
          passiveTick();
        }, rand(60000, 90000));
        timers.push(pT);
      };
      passiveTick();

      // Second bot only: may tip once after 90-120s (25% chance)
      if (botCount === 2 && Math.random() < 0.25) {
        const tipT = setTimeout(() => {
          callbacks.onTip(name);
          callbacks.onChat(name, "💸 had to tip — worth it fr");
        }, rand(90000, 120000));
        timers.push(tipT);
      }

      // Schedule next bot
      scheduleArrival(rand(45000, 90000));
    }, delayMs);

    timers.push(t);
  }

  // Initial diagnostic at 15s
  const diagT = setTimeout(() => {
    callbacks.onDiag(
      `[GhostForce V1] Room ${roomId} — monitoring active. Bots queued: ${MAX_BOTS}.`
    );
  }, 15000);
  timers.push(diagT);

  // First bot enters after 30-60s
  scheduleArrival(rand(30000, 60000));

  return () => {
    timers.forEach(clearTimeout);
  };
}

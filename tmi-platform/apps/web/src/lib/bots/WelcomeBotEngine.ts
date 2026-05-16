/**
 * Welcome Bot Engine — First-touch message for new users entering a room or completing signup.
 * Fires once per user per session. Silent after that.
 * No learning loop, no mutations to user state.
 */

export type WelcomeContext = "room-enter" | "signup-complete" | "first-login";

export interface WelcomeMessage {
  text: string;
  context: WelcomeContext;
  isSystem: boolean;
}

const ROOM_ENTER_LINES = [
  "Welcome to TMI — you're in. 🎤 Grab a seat and feel the room.",
  "You made it. The stage is live and the crowd is real. 👋",
  "TMI is live right now. Jump in — the energy in here is different. 🔥",
  "Welcome. The room is yours. Explore, connect, and make some noise. 🙌",
];

const SIGNUP_COMPLETE_LINES = [
  "Account confirmed. You're officially part of the TMI Empire. 🏆",
  "Welcome to TMI. Your dashboard is ready — go explore. 🎯",
  "You're in. Grab your avatar, find a room, and get started. 🔥",
  "TMI membership active. The stage is open whenever you're ready. 🎤",
];

const FIRST_LOGIN_LINES = [
  "Good to have you back. Pick up where you left off. 🎤",
  "You're back. The rooms are live — jump in. 🔥",
  "Welcome back to TMI. Things have been moving while you were out. 👀",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

const shownToUsers = new Set<string>(); // in-memory per session; resets on server restart

/**
 * Returns a welcome message for the user if they haven't received one yet.
 * Returns null if the user has already been welcomed this session.
 */
export function getWelcomeMessage(
  userId: string,
  context: WelcomeContext,
): WelcomeMessage | null {
  const key = `${userId}:${context}`;
  if (shownToUsers.has(key)) return null;
  shownToUsers.add(key);

  let text: string;
  if (context === "room-enter") text = pick(ROOM_ENTER_LINES);
  else if (context === "signup-complete") text = pick(SIGNUP_COMPLETE_LINES);
  else text = pick(FIRST_LOGIN_LINES);

  return { text, context, isSystem: true };
}

/** Check if this user has already been welcomed (without consuming the message). */
export function hasBeenWelcomed(userId: string, context: WelcomeContext): boolean {
  return shownToUsers.has(`${userId}:${context}`);
}

/** Reset welcome state for a user (e.g., they cleared their session). */
export function resetWelcome(userId: string): void {
  const keys = [`${userId}:room-enter`, `${userId}:signup-complete`, `${userId}:first-login`];
  keys.forEach((k) => shownToUsers.delete(k));
}

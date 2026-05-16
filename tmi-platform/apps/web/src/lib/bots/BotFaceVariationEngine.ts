import type { BotIdentityRole } from "@/lib/bots/BotFaceRegistry";

export type BotFaceVariation = {
  age: "teen" | "young-adult" | "adult" | "senior";
  hair: "short" | "curly" | "straight" | "braided" | "buzz" | "wavy";
  style: "street" | "editorial" | "formal" | "sport" | "retro" | "futuristic";
  glasses: "none" | "clear" | "round" | "visor";
  facialHair: "none" | "light" | "goatee" | "full";
  expression: "happy" | "focused" | "excited" | "neutral" | "surprised" | "celebrating" | "thinking";
  lighting: "studio" | "neon" | "sunset" | "spotlight" | "softbox";
  pose: "front" | "three-quarter" | "profile" | "dynamic";
};

function hash(seed: string): number {
  let value = 0;
  for (let index = 0; index < seed.length; index += 1) {
    value = (value * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return value;
}

function pick<T extends string>(seed: number, values: readonly T[], shift: number): T {
  return values[(seed + shift) % values.length] as T;
}

export function generateBotFaceVariation(seed: string, role: BotIdentityRole): BotFaceVariation {
  const roleBias = hash(role) % 17;
  const h = hash(`${seed}:${role}`) + roleBias;

  return {
    age: pick(h, ["teen", "young-adult", "adult", "senior"] as const, 2),
    hair: pick(h, ["short", "curly", "straight", "braided", "buzz", "wavy"] as const, 5),
    style: pick(h, ["street", "editorial", "formal", "sport", "retro", "futuristic"] as const, 7),
    glasses: pick(h, ["none", "clear", "round", "visor"] as const, 11),
    facialHair: pick(h, ["none", "light", "goatee", "full"] as const, 13),
    expression: pick(h, ["happy", "focused", "excited", "neutral", "surprised", "celebrating", "thinking"] as const, 17),
    lighting: pick(h, ["studio", "neon", "sunset", "spotlight", "softbox"] as const, 19),
    pose: pick(h, ["front", "three-quarter", "profile", "dynamic"] as const, 23),
  };
}

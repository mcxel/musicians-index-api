/**
 * 1200×630 PNG poster. No remote font and no screenshot of the long page.
 */

import { crc32, deflateSync } from "node:zlib";
import type { PublishedSocialCard } from "./publicPageSocialCard";

const WIDTH = 1200;
const HEIGHT = 630;

const GLYPHS: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  "'": ["01100", "01100", "01000", "00000", "00000", "00000", "00000"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
};

function hexRgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const head = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head, data])) >>> 0);
  return Buffer.concat([length, head, data, crc]);
}

function paintText(
  pixels: Uint8Array,
  text: string,
  x: number,
  y: number,
  scale: number,
  color: [number, number, number],
) {
  let cursor = x;
  for (const char of text) {
    const glyph = GLYPHS[char] ?? GLYPHS[" "];
    if (!glyph) continue;
    glyph.forEach((row, rowIndex) => {
      for (let col = 0; col < row.length; col += 1) {
        if (row[col] !== "1") continue;
        for (let sy = 0; sy < scale; sy += 1) {
          for (let sx = 0; sx < scale; sx += 1) {
            const px = cursor + col * scale + sx;
            const py = y + rowIndex * scale + sy;
            if (px < 0 || py < 0 || px >= WIDTH || py >= HEIGHT) continue;
            const offset = (py * WIDTH + px) * 3;
            pixels[offset] = color[0];
            pixels[offset + 1] = color[1];
            pixels[offset + 2] = color[2];
          }
        }
      }
    });
    cursor += 6 * scale;
  }
}

export function renderPublishedSocialPng(card: PublishedSocialCard): Buffer {
  const surface = hexRgb(card.surfaceHex);
  const accent = hexRgb(card.accentHex);
  const pixels = new Uint8Array(WIDTH * HEIGHT * 3);
  for (let i = 0; i < pixels.length; i += 3) {
    pixels[i] = surface[0];
    pixels[i + 1] = surface[1];
    pixels[i + 2] = surface[2];
  }
  for (let y = 36; y < HEIGHT - 36; y += 1) {
    for (let x = 36; x < WIDTH - 36; x += 1) {
      const edge = x < 44 || y < 44 || x >= WIDTH - 44 || y >= HEIGHT - 44;
      if (!edge) continue;
      const offset = (y * WIDTH + x) * 3;
      pixels[offset] = accent[0];
      pixels[offset + 1] = accent[1];
      pixels[offset + 2] = accent[2];
    }
  }
  const ink: [number, number, number] = [244, 241, 255];
  paintText(pixels, "THE MUSICIAN'S INDEX", 72, 78, 4, accent);
  paintText(pixels, card.displayName.toUpperCase().replace(/[^A-Z0-9 .'-]/g, " ").slice(0, 16), 72, 230, 14, ink);
  const motto = (card.motto || card.description).toUpperCase().replace(/[^A-Z0-9 .'-]/g, " ").slice(0, 42);
  paintText(pixels, motto, 72, 470, 4, accent);
  const raw = Buffer.alloc((WIDTH * 3 + 1) * HEIGHT);
  for (let y = 0; y < HEIGHT; y += 1) {
    const row = y * (WIDTH * 3 + 1);
    raw[row] = 0;
    Buffer.from(pixels.buffer, pixels.byteOffset + y * WIDTH * 3, WIDTH * 3).copy(raw, row + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(WIDTH, 0);
  ihdr.writeUInt32BE(HEIGHT, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/**
 * Host Speech Timing Engine
 * Calculates duration in ms for a line of spoken host dialogue.
 * Based on average MC speech rate (~160 wpm) + pause buffer.
 */

const AVG_WORDS_PER_MINUTE = 160;
const MIN_DURATION_MS = 800;
const PAUSE_BUFFER_MS = 300;

export class HostSpeechTimingEngine {
  /**
   * Calculate estimated spoken duration for a line of host dialogue.
   */
  static calculateDurationMs(text: string): number {
    const wordCount = text.trim().split(/\s+/).length;
    const rawMs = (wordCount / AVG_WORDS_PER_MINUTE) * 60_000;
    return Math.max(MIN_DURATION_MS, Math.round(rawMs) + PAUSE_BUFFER_MS);
  }

  /**
   * Calculate total duration for a sequence of lines.
   */
  static calculateSequenceDurationMs(lines: string[]): number {
    return lines.reduce((acc, line) => acc + HostSpeechTimingEngine.calculateDurationMs(line), 0);
  }

  /**
   * Build a timed cue list with cumulative offsets.
   */
  static buildCueTimeline(lines: string[]): { text: string; offsetMs: number; durationMs: number }[] {
    let cursor = 0;
    return lines.map((text) => {
      const durationMs = HostSpeechTimingEngine.calculateDurationMs(text);
      const cue = { text, offsetMs: cursor, durationMs };
      cursor += durationMs;
      return cue;
    });
  }
}

/**
 * BotContentSanitizerEngine
 * Cleans and normalizes bot-generated content only.
 * NEVER used on user posts, chat, or user-uploaded text.
 *
 * Pipelines: headline → hook → ticker → caption → system
 */

export type ContentContext = 'headline' | 'hook' | 'ticker' | 'caption' | 'system';

const TMI_UPPER = ['TMI', 'INDEX', 'LIVE', 'BATTLE', 'CYPHER', 'ARENA', 'CROWN', 'RANKINGS', 'CBC'];
const FILLER    = /\b(really|very|just|quite|basically|literally|actually|essentially|simply)\b/gi;
const SMART_Q   = /[""]/g;
const MULTI_SP  = /\s{2,}/g;
const TRAILING  = /[,;:\s]+$/;

function titleCase(s: string): string {
  const SMALL = new Set(['a','an','the','and','or','but','in','on','at','to','for','of','with','is']);
  return s
    .toLowerCase()
    .split(' ')
    .map((w, i) => (i === 0 || !SMALL.has(w)) ? w.charAt(0).toUpperCase() + w.slice(1) : w)
    .join(' ');
}

function preserveTMIVocab(s: string): string {
  let out = s;
  for (const word of TMI_UPPER) {
    out = out.replace(new RegExp(`\\b${word}\\b`, 'gi'), word);
  }
  return out;
}

function baseClean(text: string): string {
  return text
    .replace(SMART_Q,  '"')
    .replace(FILLER,   '')
    .replace(MULTI_SP, ' ')
    .replace(TRAILING, '')
    .trim();
}

export class BotContentSanitizerEngine {
  static sanitize(text: string, context: ContentContext = 'system'): string {
    let out = baseClean(text);

    switch (context) {
      case 'headline':
        out = titleCase(out);
        if (out.length > 72) out = out.slice(0, 69).trimEnd() + '…';
        break;

      case 'hook':
        out = out.toUpperCase();
        if (out.length > 48) out = out.slice(0, 45).trimEnd() + '…';
        break;

      case 'ticker':
        out = out.charAt(0).toUpperCase() + out.slice(1);
        if (out.length > 120) out = out.slice(0, 117).trimEnd() + '…';
        break;

      case 'caption':
        out = out
          .split('\n')
          .map(line => { const t = line.trim(); return t ? t.charAt(0).toUpperCase() + t.slice(1) : ''; })
          .join('\n');
        break;

      case 'system':
        // minimal: just baseClean above
        break;
    }

    return preserveTMIVocab(out).trim();
  }

  static sanitizeBatch(items: string[], context: ContentContext = 'system'): string[] {
    return items.map(item => this.sanitize(item, context));
  }

  static isClean(text: string): boolean {
    return text.length > 0 && text.length <= 500 && !/[<>{}/\\]/.test(text);
  }

  static formatHeadline(text: string): string  { return this.sanitize(text, 'headline'); }
  static formatHook(text: string): string       { return this.sanitize(text, 'hook'); }
  static formatTicker(text: string): string     { return this.sanitize(text, 'ticker'); }
  static formatCaption(text: string): string    { return this.sanitize(text, 'caption'); }
}

export default BotContentSanitizerEngine;

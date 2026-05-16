/**
 * Host Lip Sync Engine
 * Maps spoken text to mouth viseme sequences for avatar animation.
 * Uses a simplified phoneme→viseme mapping suited for MC dialogue.
 */

export type Viseme =
	| 'silence'
	| 'open'
	| 'round'
	| 'wide'
	| 'bilabial'
	| 'dental'
	| 'alveolar'
	| 'velar'
	| 'fricative';

export interface VisemeFrame {
	viseme: Viseme;
	durationMs: number;
}

const MS_PER_CHAR = 40;

const CHAR_TO_VISEME: Record<string, Viseme> = {
	a: 'open', e: 'wide', i: 'wide', o: 'round', u: 'round',
	b: 'bilabial', p: 'bilabial', m: 'bilabial',
	f: 'dental', v: 'dental',
	t: 'alveolar', d: 'alveolar', n: 'alveolar', l: 'alveolar',
	k: 'velar', g: 'velar',
	s: 'fricative', z: 'fricative', h: 'fricative',
};

function textToVisemes(text: string): Viseme[] {
	const visemes: Viseme[] = [];
	for (const char of text.toLowerCase()) {
		const v = CHAR_TO_VISEME[char];
		if (v) visemes.push(v);
	}
	return visemes;
}

export class HostLipSyncEngine {
	static buildVisemeFrames(text: string): VisemeFrame[] {
		const raw = textToVisemes(text);
		if (raw.length === 0) return [{ viseme: 'silence', durationMs: 400 }];

		const frames: VisemeFrame[] = [];
		let i = 0;
		while (i < raw.length) {
			let count = 1;
			while (i + count < raw.length && raw[i + count] === raw[i]) count++;
			frames.push({ viseme: raw[i], durationMs: MS_PER_CHAR * count });
			i += count;
		}
		frames.push({ viseme: 'silence', durationMs: 200 });
		return frames;
	}

	static totalDurationMs(frames: VisemeFrame[]): number {
		return frames.reduce((acc, f) => acc + f.durationMs, 0);
	}
}

/**
 * Host Blink Engine
 * Drives automatic blinking loop for host avatars.
 * Randomises blink interval within natural human range (3–6 seconds).
 * Double-blink trigger for emotional emphasis events.
 */

export type BlinkState = 'open' | 'closing' | 'closed' | 'opening';

export interface BlinkFrame {
	state: BlinkState;
	durationMs: number;
}

/** Standard blink sequence: open → closing → closed → opening → open */
const BLINK_SEQUENCE: BlinkFrame[] = [
	{ state: 'closing', durationMs: 60 },
	{ state: 'closed',  durationMs: 40 },
	{ state: 'opening', durationMs: 70 },
	{ state: 'open',    durationMs: 0  },
];

const DOUBLE_BLINK_SEQUENCE: BlinkFrame[] = [
	...BLINK_SEQUENCE,
	{ state: 'closing', durationMs: 60 },
	{ state: 'closed',  durationMs: 40 },
	{ state: 'opening', durationMs: 70 },
	{ state: 'open',    durationMs: 0  },
];

export interface BlinkLoopConfig {
	minIntervalMs: number;
	maxIntervalMs: number;
}

const DEFAULT_CONFIG: BlinkLoopConfig = {
	minIntervalMs: 3_000,
	maxIntervalMs: 6_500,
};

export class HostBlinkEngine {
	static nextIntervalMs(config: BlinkLoopConfig = DEFAULT_CONFIG): number {
		return (
			config.minIntervalMs +
			Math.floor(Math.random() * (config.maxIntervalMs - config.minIntervalMs))
		);
	}

	static getBlinkSequence(): BlinkFrame[] {
		return BLINK_SEQUENCE;
	}

	static getDoubleBlinkSequence(): BlinkFrame[] {
		return DOUBLE_BLINK_SEQUENCE;
	}

	static blinkDurationMs(): number {
		return BLINK_SEQUENCE.reduce((acc, f) => acc + f.durationMs, 0);
	}
}

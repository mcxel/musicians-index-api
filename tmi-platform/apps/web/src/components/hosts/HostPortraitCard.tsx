'use client';

import React, { useEffect, useRef, useState } from 'react';
import { HostBlinkEngine, type BlinkState } from '@/lib/hosts/HostBlinkEngine';
import { HostLipSyncEngine, type VisemeFrame } from '@/lib/hosts/HostLipSyncEngine';
import { type HostEmotionalState } from '@/lib/hosts/HostEmotionReactionEngine';
import { ImageSlotWrapper } from '@/components/visual-enforcement';

export interface HostMotionAvatarProps {
	hostId: string;
	displayName: string;
	avatarSrc?: string;
	emotionalState?: HostEmotionalState;
	activeLine?: string;      // text currently being spoken
	className?: string;
}

export function HostMotionAvatar({
	hostId,
	displayName,
	avatarSrc,
	emotionalState = 'neutral',
	activeLine,
	className = '',
}: HostMotionAvatarProps) {
	const [blinkState, setBlinkState] = useState<BlinkState>('open');
	const [viseme, setViseme] = useState<VisemeFrame['viseme']>('silence');
	const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// ── Blink loop ──────────────────────────────────────────────────────────────
	useEffect(() => {
		function scheduleBlink() {
			const wait = HostBlinkEngine.nextIntervalMs();
			blinkTimerRef.current = setTimeout(() => {
				const frames = HostBlinkEngine.getBlinkSequence();
				let delay = 0;
				for (const frame of frames) {
					setTimeout(() => setBlinkState(frame.state), delay);
					delay += frame.durationMs;
				}
				setTimeout(scheduleBlink, delay);
			}, wait);
		}
		scheduleBlink();
		return () => {
			if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
		};
	}, []);

	// ── Lip sync ─────────────────────────────────────────────────────────────────
	useEffect(() => {
		if (lipTimerRef.current) clearTimeout(lipTimerRef.current);
		if (!activeLine) { setViseme('silence'); return; }

		const frames = HostLipSyncEngine.buildVisemeFrames(activeLine);
		let delay = 0;
		for (const frame of frames) {
			const v = frame.viseme;
			const d = frame.durationMs;
			lipTimerRef.current = setTimeout(() => setViseme(v), delay);
			delay += d;
		}
		lipTimerRef.current = setTimeout(() => setViseme('silence'), delay);
		return () => {
			if (lipTimerRef.current) clearTimeout(lipTimerRef.current);
		};
	}, [activeLine]);

	// ── Derived style helpers ─────────────────────────────────────────────────────
	const eyeScale = blinkState === 'closed' ? 'scaleY(0)' : blinkState === 'closing' ? 'scaleY(0.2)' : blinkState === 'opening' ? 'scaleY(0.5)' : 'scaleY(1)';

	const mouthWidth: Record<VisemeFrame['viseme'], string> = {
		silence:  '28px',
		open:     '36px',
		round:    '24px',
		wide:     '40px',
		bilabial: '16px',
		dental:   '30px',
		alveolar: '28px',
		velar:    '26px',
		fricative:'32px',
	};

	const emotionBorder: Record<HostEmotionalState, string> = {
		neutral:     'border-white/20',
		smirk:       'border-yellow-400/60',
		laugh:       'border-green-400/60',
		shock:       'border-cyan-400/60',
		serious:     'border-red-500/60',
		celebrate:   'border-pink-400/80',
		disappointed:'border-gray-500/40',
	};

	return (
		<div
			className={`relative flex flex-col items-center select-none ${className}`}
			data-host-id={hostId}
			data-emotion={emotionalState}
		>
			{/* Avatar frame */}
			<div
				className={`relative w-24 h-24 rounded-full border-4 overflow-hidden transition-all duration-300 ${emotionBorder[emotionalState] ?? 'border-white/20'}`}
			>
				{avatarSrc ? (
					<ImageSlotWrapper imageId="img-gij7gk" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
				) : (
					<div className="w-full h-full bg-neutral-800 flex items-center justify-center text-3xl">
						🎙️
					</div>
				)}

				{/* Eye overlay */}
				<div
					className="absolute inset-0 pointer-events-none flex items-center justify-center gap-3"
					aria-hidden
				>
					{(['left', 'right'] as const).map((side) => (
						<span
							key={side}
							className="block w-2 h-2 rounded-full bg-white"
							style={{ transform: eyeScale, transition: 'transform 60ms linear' }}
						/>
					))}
				</div>
			</div>

			{/* Mouth / lip-sync indicator */}
			<div
				className="mt-1 h-2 rounded-full bg-white/50 transition-all duration-75"
				style={{ width: mouthWidth[viseme] }}
				aria-hidden
			/>

			{/* Name label */}
			<span className="mt-2 text-xs font-semibold text-white/80 truncate max-w-[96px] text-center">
				{displayName}
			</span>

			{/* Emotion badge */}
			{emotionalState !== 'neutral' && (
				<span className="mt-0.5 text-[10px] text-white/40 italic">{emotionalState}</span>
			)}
		</div>
	);
}

export default HostMotionAvatar;

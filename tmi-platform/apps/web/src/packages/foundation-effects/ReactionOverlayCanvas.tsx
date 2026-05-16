"use client";

import type { ReactNode } from "react";

export type OverlayEffect = {
	id: string;
	label: string;
	x?: number;
	y?: number;
	node?: ReactNode;
};

type ReactionOverlayCanvasProps = {
	activeEffects?: OverlayEffect[];
};

/**
 * Click-safe overlay for reaction/effects rendering.
 */
export default function ReactionOverlayCanvas({ activeEffects = [] }: ReactionOverlayCanvasProps) {
	return (
		<div
			className="pointer-events-none absolute inset-0 z-50 overflow-hidden"
			data-overlay-canvas="reactions"
			aria-hidden
			style={{ pointerEvents: "none" }}
		>
			{activeEffects.map((effect) => (
				<div
					key={effect.id}
					className="absolute text-cyan-300 text-xs font-semibold tracking-wide animate-pulse"
					style={{
						left: `${effect.x ?? 50}%`,
						top: `${effect.y ?? 50}%`,
						transform: "translate(-50%, -50%)",
					}}
					data-overlay-effect="active"
				>
					{effect.node ?? effect.label}
				</div>
			))}
		</div>
	);
}


"use client";

type ReactionBarProps = {
	onReact: (type: string) => void;
	className?: string;
};

export default function ReactionBar({ onReact, className }: ReactionBarProps) {
	const emotes = ["FIRE", "CLAP", "LOL", "CROWN", "TOMATO"];

	return (
		<div
			className={[
				"reaction-bar flex items-center gap-2 rounded-full border border-zinc-800 bg-black/60 p-2 shadow-2xl backdrop-blur-xl",
				className,
			]
				.filter(Boolean)
				.join(" ")}
			data-interaction-widget="reaction-bar"
		>
			{emotes.map((emote) => (
				<button
					key={emote}
					type="button"
					onClick={() => onReact(emote)}
					className="h-9 rounded-full bg-white/5 px-3 text-[10px] font-bold tracking-widest text-zinc-200 transition-all hover:scale-105 hover:bg-white/20 active:scale-95"
					aria-label={`React with ${emote}`}
				>
					{emote}
				</button>
			))}
		</div>
	);
}


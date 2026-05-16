import type { ComponentPropsWithoutRef } from "react";

type StageFrameTheme = "dark-concert" | "neon-retro" | "royal-arena";

type StageFrameProps = ComponentPropsWithoutRef<"section"> & {
	children: React.ReactNode;
	theme?: StageFrameTheme;
};

const themeMap: Record<StageFrameTheme, string> = {
	"dark-concert": "from-zinc-950 via-black to-zinc-900",
	"neon-retro": "from-indigo-950 via-purple-900 to-black",
	"royal-arena": "from-amber-950 via-black to-zinc-950",
};

export default function StageFrame({ children, theme = "dark-concert", className, ...props }: StageFrameProps) {
	return (
		<section
			className={[
				"relative w-full min-h-[70vh] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b shadow-2xl",
				themeMap[theme],
				className,
			]
				.filter(Boolean)
				.join(" ")}
			data-visual-surface="stage"
			{...props}
		>
			<div className="absolute left-1/2 top-0 h-64 w-3/4 -translate-x-1/2 bg-white/5 blur-[100px] pointer-events-none" />
			<div className="relative z-10 h-full w-full">{children}</div>
		</section>
	);
}


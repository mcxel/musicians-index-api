type VenueTheme = "neon-retro" | "dark-concert" | "golden-awards";

type VenueSkinShellProps = {
	children: React.ReactNode;
	theme?: VenueTheme;
	className?: string;
};

const themeStyles: Record<VenueTheme, string> = {
	"neon-retro": "bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-fuchsia-900 via-black to-black border-t-fuchsia-500/50",
	"dark-concert": "bg-gradient-to-b from-zinc-950 via-black to-zinc-900 border-t-zinc-800",
	"golden-awards": "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/40 via-black to-black border-t-yellow-500/40",
};

export default function VenueSkinShell({ children, theme = "neon-retro", className }: VenueSkinShellProps) {
	return (
		<section
			className={[
				"relative w-full min-h-full overflow-hidden border-t-4",
				themeStyles[theme],
				className,
			]
				.filter(Boolean)
				.join(" ")}
			data-visual-surface="venue-shell"
		>
			<div className="pointer-events-none absolute inset-0 opacity-10 mix-blend-overlay [background-image:radial-gradient(rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:3px_3px]" />
			<div className="relative z-10 flex h-full w-full flex-col">{children}</div>
		</section>
	);
}


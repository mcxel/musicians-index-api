type LiveVideoShellProps = {
	children: React.ReactNode;
	performerName: string;
	isSpeaking?: boolean;
	className?: string;
};

export default function LiveVideoShell({
	children,
	performerName,
	isSpeaking = false,
	className,
}: LiveVideoShellProps) {
	return (
		<div
			className={[
				"live-video-shell relative aspect-video overflow-hidden rounded-2xl border-2 bg-black transition-all duration-300",
				isSpeaking
					? "border-green-400 shadow-[0_0_25px_rgba(74,222,128,0.4)]"
					: "border-zinc-800 shadow-xl",
				className,
			]
				.filter(Boolean)
				.join(" ")}
			data-video-shell="performer"
		>
			<div className="absolute inset-0 z-0">{children}</div>
			<div className="absolute left-3 top-3 z-10 flex items-center gap-2">
				<span className="animate-pulse rounded bg-red-600 px-2 py-1 text-[10px] font-black tracking-widest text-white">LIVE</span>
				<span className="rounded border border-white/10 bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
					{performerName}
				</span>
			</div>
		</div>
	);
}


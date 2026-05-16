type BillboardFrameProps = {
	children: React.ReactNode;
	sponsorTag?: string;
	className?: string;
};

export default function BillboardFrame({ children, sponsorTag, className }: BillboardFrameProps) {
	return (
		<section
			className={[
				"relative w-full overflow-hidden rounded-3xl border-2 border-cyan-400/50 bg-black/60 p-6 shadow-[0_0_40px_rgba(0,255,255,0.2)] backdrop-blur-2xl",
				className,
			]
				.filter(Boolean)
				.join(" ")}
			data-visual-surface="billboard"
		>
			{sponsorTag ? (
				<div className="absolute right-4 top-4 z-20 rounded-full bg-cyan-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black">
					Presented by {sponsorTag}
				</div>
			) : null}
			<div className="relative z-10 h-full w-full">{children}</div>
		</section>
	);
}


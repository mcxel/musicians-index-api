type AngledPanelProps = {
	children: React.ReactNode;
	className?: string;
};

export default function AngledPanel({ children, className }: AngledPanelProps) {
	return (
		<div
			className={[
				"relative border-l-4 border-fuchsia-500 bg-zinc-900 p-5 text-white shadow-xl transition-transform hover:-translate-y-1",
				className,
			]
				.filter(Boolean)
				.join(" ")}
			style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 90% 100%, 0 100%)" }}
			data-visual-shape="angled"
		>
			{children}
		</div>
	);
}


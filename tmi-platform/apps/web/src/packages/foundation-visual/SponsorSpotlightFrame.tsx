import { ImageSlotWrapper } from '@/components/visual-enforcement';
type SponsorSpotlightFrameProps = {
	brandName: string;
	message: string;
	logoUrl?: string;
	href?: string;
};

export default function SponsorSpotlightFrame({
	brandName,
	message,
	logoUrl,
	href,
}: SponsorSpotlightFrameProps) {
	const content = (
		<div className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-yellow-500/30 bg-zinc-950 p-1 transition-all hover:shadow-[0_0_30px_rgba(234,179,8,0.15)]">
			<div className="absolute left-0 top-0 h-full w-1 bg-yellow-500" />
			<div className="ml-4 flex h-16 w-16 items-center justify-center rounded-xl border border-white/5 bg-black p-2">
				{logoUrl ? (
					<ImageSlotWrapper imageId="img-yy2ex" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
				) : (
					<div className="text-xs font-bold text-yellow-500">{brandName.slice(0, 1)}</div>
				)}
			</div>
			<div className="flex flex-col py-3 pr-4">
				<span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Sponsored by {brandName}</span>
				<p className="mt-1 text-sm font-medium leading-snug text-zinc-300">{message}</p>
			</div>
		</div>
	);

	if (!href) return content;

	return (
		<a href={href} className="block" data-market-click="sponsor-spotlight">
			{content}
		</a>
	);
}


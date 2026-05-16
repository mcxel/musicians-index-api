import { ImageSlotWrapper } from '@/components/visual-enforcement';
type ArticleFeatureCardProps = {
	title: string;
	category: string;
	imageUrl?: string;
};

export default function ArticleFeatureCard({ title, category, imageUrl }: ArticleFeatureCardProps) {
	return (
		<article className="group relative h-80 w-full cursor-pointer overflow-hidden rounded-2xl border border-white/10 transition-colors hover:border-cyan-400/50" data-widget="article-feature-card">
			{imageUrl ? (
				<ImageSlotWrapper imageId="img-s6gj6k" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
			) : (
				<div className="absolute inset-0 bg-gradient-to-br from-cyan-700/30 via-zinc-900 to-black" />
			)}
			<div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

			<div className="absolute bottom-0 left-0 flex w-full flex-col justify-end p-6">
				<span className="mb-2 text-[10px] font-black uppercase tracking-widest text-cyan-400">{category}</span>
				<h3 className="line-clamp-2 font-serif text-2xl font-bold leading-tight text-white transition-colors group-hover:text-cyan-300">
					{title}
				</h3>
			</div>
		</article>
	);
}


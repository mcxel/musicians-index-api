type ArticleCardProps = {
  title: string;
  category: string;
  author?: string;
  excerpt?: string;
  href?: string;
  accent?: "cyan" | "pink" | "purple" | "gold";
};

export default function ArticleCard({ title, category, author, excerpt, href }: ArticleCardProps) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/5 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-cyan-200">{category}</p>
      <p className="mt-1 text-sm font-bold text-white">{title}</p>
      {author ? <p className="text-xs text-zinc-300">by {author}</p> : null}
      {excerpt ? <p className="mt-1 text-xs text-zinc-400">{excerpt}</p> : null}
      {href ? <a href={href} className="mt-2 inline-block text-[10px] text-cyan-300">Read</a> : null}
    </article>
  );
}

type SongCardProps = {
  rank: number;
  title: string;
  artist: string;
  genre: string;
  plays: string;
  change: "up" | "down" | "same" | "new";
  href?: string;
};

export default function SongCard({ rank, title, artist, genre, plays, change, href }: SongCardProps) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/5 p-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-black text-cyan-200">#{rank}</span>
        <span className="uppercase text-zinc-400">{change}</span>
      </div>
      <p className="mt-1 text-sm font-bold text-white">{title}</p>
      <p className="text-xs text-zinc-300">{artist} · {genre}</p>
      <p className="text-[10px] text-zinc-400">{plays}</p>
      {href ? <a href={href} className="text-[10px] text-cyan-300">Open</a> : null}
    </article>
  );
}

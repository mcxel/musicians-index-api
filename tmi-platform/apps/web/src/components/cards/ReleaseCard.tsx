type ReleaseCardProps = {
  title: string;
  genre: string;
  bpm: number;
  color: string;
  href?: string;
};

export default function ReleaseCard({ title, genre, bpm, color, href }: ReleaseCardProps) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/5 p-3" style={{ boxShadow: `0 0 0 1px ${color}33 inset` }}>
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="text-xs text-zinc-300">{genre} · {bpm} BPM</p>
      {href ? <a href={href} className="mt-2 inline-block text-[10px]" style={{ color }}>Open</a> : null}
    </article>
  );
}

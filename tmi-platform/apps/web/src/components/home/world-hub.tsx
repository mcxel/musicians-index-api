'use client';

type WorldHubCardProps = {
  title: string;
  value: string;
  description?: string;
};

export function WorldHubCard({ title, value, description }: WorldHubCardProps) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">{title}</p>
      <p className="mt-2 text-2xl font-bold text-zinc-100">{value}</p>
      {description ? <p className="mt-2 text-sm text-zinc-400">{description}</p> : null}
    </article>
  );
}

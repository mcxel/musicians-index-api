type MagazineFrameProps = {
  children: React.ReactNode;
  title?: string;
};

export default function MagazineFrame({ children, title }: MagazineFrameProps) {
  return (
    <article className="relative overflow-hidden border-l-4 border-cyan-500 bg-zinc-950 p-8 text-zinc-100 shadow-2xl md:p-10" data-visual-surface="magazine">
      <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-[80px]" />
      {title ? (
        <h2 className="relative z-10 mb-6 text-3xl font-black uppercase italic tracking-tight md:text-4xl">{title}</h2>
      ) : null}
      {children}
    </article>
  );
}

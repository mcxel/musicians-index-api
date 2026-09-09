export default function HomeLoading() {
  return (
    <main
      className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden bg-[#06070d]"
      aria-busy="true"
      aria-label="Loading TMI home"
    >
      <div className="px-6 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300/80">
          The Musician&apos;s Index
        </p>
        <p className="mt-3 text-sm text-white/50">Loading home…</p>
      </div>
    </main>
  );
}

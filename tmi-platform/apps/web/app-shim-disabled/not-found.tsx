import Link from "next/link";

export default function RootNotFound() {
  return (
    <main className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-6">
      <div className="max-w-lg rounded-xl border border-white/20 bg-zinc-950/80 p-6 text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-300">404</p>
        <h1 className="mt-2 text-2xl font-black uppercase">Page Not Found</h1>
        <p className="mt-3 text-sm text-zinc-300">The route does not exist or is temporarily unavailable.</p>
        <Link
          href="/home/1"
          className="mt-5 inline-flex rounded border border-cyan-300/45 px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-cyan-100 hover:border-cyan-100"
        >
          Back To Home 1
        </Link>
      </div>
    </main>
  );
}

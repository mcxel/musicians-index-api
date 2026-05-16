import Link from "next/link";

export default function AuthRequiredPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-8 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,255,0.04)_0%,transparent_70%)] pointer-events-none" />
      <div className="relative z-10 max-w-lg text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full border-2 border-cyan-500/40 flex items-center justify-center">
          <span className="text-4xl">🔐</span>
        </div>
        <p className="text-[9px] font-black tracking-[0.5em] uppercase text-cyan-400/60">Access Restricted</p>
        <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">Sign In Required</h2>
        <p className="text-zinc-400 text-sm">
          This section requires a TMI account. Sign in to access your profile, voting, rewards, and live rooms — or create a free account to get started.
        </p>
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Link href="/auth/signin" className="px-6 py-3 bg-cyan-500 text-black font-black text-sm uppercase tracking-widest rounded-full hover:bg-cyan-400 transition">
            Sign In
          </Link>
          <Link href="/auth/signup" className="px-6 py-3 bg-white/10 border border-white/20 font-bold text-sm uppercase tracking-widest rounded-full hover:border-cyan-400/60 hover:text-cyan-400 transition">
            Create Account
          </Link>
          <Link href="/home/1" className="px-6 py-3 text-zinc-500 text-sm underline underline-offset-4 hover:text-zinc-300 transition">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

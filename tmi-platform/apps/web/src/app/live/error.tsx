"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function LiveError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  // Full diagnostic block — this is the piece that was missing before: the
  // card only ever showed error.message, which for a minified production
  // error ("Cannot read properties of undefined (reading 'X')") is useless
  // without the digest (correlates to the server-side stack in Vercel's
  // function logs) and the route/roomId it happened on. Logged to console
  // AND rendered on-screen so a screenshot alone is enough to diagnose —
  // no DevTools Console tab required.
  const diagnostic = {
    route: pathname,
    message: error?.message ?? "(no message)",
    digest: error?.digest ?? "(no digest — error did not reach the server boundary)",
    stack: error?.stack ?? "(no stack available in this environment)",
    timestamp: new Date().toISOString(),
  };

  useEffect(() => {
    console.error("[live/error boundary] full diagnostic:", diagnostic);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const diagnosticText = `Route: ${diagnostic.route}\nMessage: ${diagnostic.message}\nDigest: ${diagnostic.digest}\nTime: ${diagnostic.timestamp}\n\nStack:\n${diagnostic.stack}`;

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto grid max-w-3xl gap-4">
        <header className="rounded-xl border border-rose-400/35 bg-rose-950/20 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-300">Live Route Error</p>
          <h1 className="mt-1 text-2xl font-black uppercase tracking-tight">Recover Live Runtime</h1>
          <p className="mt-2 text-xs text-zinc-300">A recoverable error occurred while rendering the live segment.</p>
          {error?.message ? (
            <p className="mt-2 rounded border border-rose-300/20 bg-black/30 p-2 text-xs text-rose-200">{error.message}</p>
          ) : null}
          <div className="mt-3 rounded border border-white/10 bg-black/40 p-2">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400">Diagnostic (screenshot or copy this)</p>
            <p className="mt-1 break-all font-mono text-[10px] text-zinc-300">Route: {diagnostic.route}</p>
            <p className="mt-1 break-all font-mono text-[10px] text-zinc-300">Digest: {diagnostic.digest}</p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(diagnosticText).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }).catch(() => {});
              }}
              className="mt-2 rounded border border-white/15 bg-white/5 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-zinc-200"
            >
              {copied ? "Copied ✓" : "Copy Full Diagnostic"}
            </button>
          </div>
        </header>

        <section className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={reset}
              className="rounded border border-cyan-400/35 bg-cyan-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-cyan-100"
            >
              Retry
            </button>
            <Link
              href="/live"
              className="rounded border border-fuchsia-400/35 bg-fuchsia-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-fuchsia-100"
            >
              Reload /live
            </Link>
            <Link
              href="/"
              className="rounded border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-zinc-200"
            >
              Home
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

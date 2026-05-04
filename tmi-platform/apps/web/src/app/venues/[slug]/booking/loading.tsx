export default function VenueBookingLoading() {
  return (
    <main className="min-h-screen bg-[#07040a] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl rounded-3xl border border-amber-400/20 bg-amber-400/5 p-6">
        <div className="h-3 w-32 animate-pulse rounded bg-amber-400/20" />
        <div className="mt-3 h-8 w-64 animate-pulse rounded bg-zinc-800" />
        <div className="mt-4 h-4 w-full animate-pulse rounded bg-zinc-900" />
        <div className="mt-6 flex gap-3">
          <div className="h-8 w-36 animate-pulse rounded-full border border-white/10 bg-zinc-900" />
          <div className="h-8 w-28 animate-pulse rounded-full border border-white/10 bg-zinc-900" />
        </div>
      </div>
    </main>
  );
}

import RefundBatchCard from '@/components/hud/RefundBatchCard'

export default function RefundAdminPage() {
  return (
    <main className="min-h-screen bg-[#070b0a] px-4 py-6 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4">
          <div className="text-sm text-white/60">Admin</div>
          <h1 className="text-2xl font-semibold">Refund Control Room</h1>
          <p className="mt-1 text-sm text-white/60">
            Batch approvals, policy preview, processor status, and dispute-safe audit logging.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <RefundBatchCard />

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-sm text-white/70">Policy Preview</div>
            <div className="text-lg font-semibold">Refund Rules</div>
            <div className="mt-2 text-sm text-white/60">
              Coming next: show active RefundPolicy per event + tier, plus auto-rules:
              <ul className="mt-2 list-disc pl-5">
                <li>Event canceled → auto-approve all tickets</li>
                <li>Before doors open + within window → approve if policy allows</li>
                <li>After doors open → block unless event canceled / emergency override</li>
                <li>Fee handling → “fees refundable or not” per policy</li>
                <li>Idempotency + audit trail always</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
 

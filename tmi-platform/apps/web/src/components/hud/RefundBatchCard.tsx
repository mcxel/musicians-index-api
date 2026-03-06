"use client"

import React, { useMemo, useState } from 'react'

type RefundStatus = 'PENDING' | 'APPROVED' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED'
type RefundReason = 'EVENT_CANCELED' | 'EVENT_RESCHEDULED' | 'VENUE_ISSUE' | 'DUPLICATE' | 'CUSTOMER_REQUEST' | 'FRAUD' | 'OTHER'

type RefundRow = {
  id: string
  createdAt: string
  orderId?: string
  ticketId?: string
  amountCents: number
  status: RefundStatus
  reason: RefundReason
  note?: string
}

const fmtMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`

export default function RefundBatchCard() {
  const [rows, setRows] = useState<RefundRow[]>([
    {
      id: 'rf_demo_001',
      createdAt: new Date().toISOString(),
      orderId: 'ord_demo_001',
      ticketId: 'tkt_demo_001',
      amountCents: 2500,
      status: 'PENDING',
      reason: 'CUSTOMER_REQUEST',
      note: 'Customer says duplicate purchase.',
    },
    {
      id: 'rf_demo_002',
      createdAt: new Date(Date.now() - 3600_000).toISOString(),
      orderId: 'ord_demo_002',
      ticketId: 'tkt_demo_010',
      amountCents: 5000,
      status: 'APPROVED',
      reason: 'EVENT_CANCELED',
      note: 'Auto-approve: event canceled.',
    },
  ])

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<RefundStatus | 'ALL'>('ALL')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((r) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false
      if (!q) return true
      return (
        r.id.toLowerCase().includes(q) ||
        (r.orderId ?? '').toLowerCase().includes(q) ||
        (r.ticketId ?? '').toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q) ||
        (r.note ?? '').toLowerCase().includes(q)
      )
    })
  }, [rows, query, statusFilter])

  const counts = useMemo(() => {
    const map = new Map<RefundStatus, number>()
    for (const r of rows) map.set(r.status, (map.get(r.status) ?? 0) + 1)
    return map
  }, [rows])

  function approveSelected(ids: string[]) {
    setRows((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, status: 'APPROVED' } : r)))
  }
  function cancelSelected(ids: string[]) {
    setRows((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, status: 'CANCELED' } : r)))
  }

  const [selected, setSelected] = useState<Record<string, boolean>>({})

  const selectedIds = Object.entries(selected)
    .filter(([, v]) => v)
    .map(([k]) => k)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-4 shadow-sm">
      {/* gloss/sheen */}
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -left-1/3 top-0 h-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-[2px] animate-[sheen_4.5s_linear_infinite]" />
      </div>

      <style jsx>{`
        @keyframes sheen {
          0% { transform: translateX(-60%) rotate(12deg); opacity: 0; }
          10% { opacity: 1; }
          40% { opacity: 0.7; }
          100% { transform: translateX(220%) rotate(12deg); opacity: 0; }
        }
      `}</style>

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-white/70">Refund Admin</div>
          <div className="text-lg font-semibold text-white">Refund Batch Queue</div>
          <div className="mt-1 text-xs text-white/60">
            UI scaffold now → wire to Prisma + Stripe bridge/escrow next.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['PENDING', 'APPROVED', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELED'] as RefundStatus[]).map((s) => (
            <span
              key={s}
              className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[11px] text-white/80"
              title={`${counts.get(s) ?? 0} ${s}`}
            >
              {s}:{counts.get(s) ?? 0}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search refunds (id, order, ticket, reason)…"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-lime-400/50"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter((e.target as HTMLSelectElement).value as unknown as RefundStatus | 'ALL')}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/50"
            >
              <option value="ALL">ALL</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SUCCEEDED">SUCCEEDED</option>
              <option value="FAILED">FAILED</option>
              <option value="CANCELED">CANCELED</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => approveSelected(selectedIds)}
              disabled={selectedIds.length === 0}
              className="rounded-xl border border-lime-400/30 bg-lime-500/10 px-3 py-2 text-sm text-lime-200 disabled:opacity-40"
            >
              Approve
            </button>
            <button
              onClick={() => cancelSelected(selectedIds)}
              disabled={selectedIds.length === 0}
              className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={() => alert('Next: Process batch → Stripe bridge/escrow + idempotency')}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/80"
            >
              Process Batch
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-12 gap-2 bg-black/40 px-3 py-2 text-[11px] text-white/60">
            <div className="col-span-1">Sel</div>
            <div className="col-span-3">Refund</div>
            <div className="col-span-2">Order</div>
            <div className="col-span-2">Ticket</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Status</div>
          </div>

          <div className="max-h-[360px] overflow-auto">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-12 gap-2 border-t border-white/10 px-3 py-2 text-xs text-white/80 hover:bg-white/5"
              >
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={!!selected[r.id]}
                    onChange={(e) => setSelected((p) => ({ ...p, [r.id]: e.target.checked }))}
                  />
                </div>
                <div className="col-span-3">
                  <div className="font-medium text-white">{r.id}</div>
                  <div className="text-[11px] text-white/50">{new Date(r.createdAt).toLocaleString()}</div>
                  <div className="text-[11px] text-white/60">{r.reason}</div>
                </div>
                <div className="col-span-2">{r.orderId ?? '—'}</div>
                <div className="col-span-2">{r.ticketId ?? '—'}</div>
                <div className="col-span-2">{fmtMoney(r.amountCents)}</div>
                <div className="col-span-2">
                  <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[11px]">
                    {r.status}
                  </span>
                </div>
                {r.note ? (
                  <div className="col-span-12 -mt-1 text-[11px] text-white/50">{r.note}</div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-white/55">
          Next wiring (production): RefundPolicy rules → eligibility checks → create Refund → process via Stripe/escrow →
          audit log → notify buyer.
        </div>
      </div>
    </div>
  )
}

"use client";

export type TmiStatus = "ACTIVE" | "LOCKED" | "NEEDS_SETUP";

const CHIP_CLASS: Record<TmiStatus, string> = {
  ACTIVE:
    "border-emerald-300/50 bg-emerald-500/20 text-emerald-100 shadow-[0_0_16px_rgba(16,185,129,0.35)]",
  LOCKED:
    "border-rose-300/50 bg-rose-500/20 text-rose-100 shadow-[0_0_16px_rgba(244,63,94,0.35)]",
  NEEDS_SETUP:
    "border-amber-300/50 bg-amber-500/20 text-amber-100 shadow-[0_0_16px_rgba(245,158,11,0.35)]",
};

function normalizeStatus(status: string): TmiStatus {
  if (status === "ACTIVE" || status === "LOCKED" || status === "NEEDS_SETUP") {
    return status;
  }
  return "NEEDS_SETUP";
}

export default function TmiStatusChip({ status }: { status: string }) {
  const normalized = normalizeStatus(status);
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] ${CHIP_CLASS[normalized]}`}
    >
      {normalized}
    </span>
  );
}

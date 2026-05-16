import type { ReactNode } from "react";

type MagazineTone = "cyan" | "fuchsia" | "emerald" | "amber" | "violet";

interface MagazineFrameLayerProps {
  children: ReactNode;
  tone?: MagazineTone;
  className?: string;
  closed?: boolean;
}

const TONE_STYLES: Record<MagazineTone, { border: string; glow: string; wash: string }> = {
  cyan: {
    border: "border-cyan-300/40",
    glow: "shadow-[0_0_54px_rgba(34,211,238,0.28),0_0_120px_rgba(34,211,238,0.10),inset_0_0_0_1px_rgba(34,211,238,0.06)]",
    wash: "bg-[radial-gradient(circle_at_14%_14%,rgba(34,211,238,0.18),transparent_36%),radial-gradient(circle_at_86%_18%,rgba(250,204,21,0.12),transparent_32%),linear-gradient(180deg,rgba(9,12,24,0.96),rgba(5,7,17,0.99))]",
  },
  fuchsia: {
    border: "border-fuchsia-300/40",
    glow: "shadow-[0_0_54px_rgba(217,70,239,0.28),0_0_120px_rgba(217,70,239,0.10),inset_0_0_0_1px_rgba(217,70,239,0.06)]",
    wash: "bg-[radial-gradient(circle_at_18%_14%,rgba(217,70,239,0.18),transparent_36%),radial-gradient(circle_at_82%_20%,rgba(34,211,238,0.12),transparent_34%),linear-gradient(180deg,rgba(16,9,24,0.96),rgba(7,5,17,0.99))]",
  },
  emerald: {
    border: "border-emerald-300/40",
    glow: "shadow-[0_0_54px_rgba(52,211,153,0.24),0_0_120px_rgba(52,211,153,0.09),inset_0_0_0_1px_rgba(52,211,153,0.06)]",
    wash: "bg-[radial-gradient(circle_at_16%_14%,rgba(52,211,153,0.18),transparent_36%),radial-gradient(circle_at_82%_20%,rgba(34,211,238,0.12),transparent_34%),linear-gradient(180deg,rgba(9,18,20,0.96),rgba(6,10,13,0.99))]",
  },
  amber: {
    border: "border-amber-300/40",
    glow: "shadow-[0_0_54px_rgba(251,191,36,0.24),0_0_120px_rgba(251,191,36,0.09),inset_0_0_0_1px_rgba(251,191,36,0.06)]",
    wash: "bg-[radial-gradient(circle_at_16%_14%,rgba(251,191,36,0.18),transparent_36%),radial-gradient(circle_at_82%_78%,rgba(244,114,182,0.1),transparent_36%),linear-gradient(180deg,rgba(22,16,11,0.96),rgba(8,7,10,0.99))]",
  },
  violet: {
    border: "border-violet-300/40",
    glow: "shadow-[0_0_54px_rgba(167,139,250,0.24),0_0_120px_rgba(167,139,250,0.09),inset_0_0_0_1px_rgba(167,139,250,0.06)]",
    wash: "bg-[radial-gradient(circle_at_16%_14%,rgba(167,139,250,0.18),transparent_36%),radial-gradient(circle_at_82%_78%,rgba(34,211,238,0.1),transparent_36%),linear-gradient(180deg,rgba(15,11,24,0.96),rgba(8,7,16,0.99))]",
  },
};

export default function MagazineFrameLayer({ children, tone = "cyan", className = "", closed = false }: MagazineFrameLayerProps) {
  const toneStyle = TONE_STYLES[tone];

  return (
    <section className={`relative mx-auto w-full overflow-hidden rounded-[28px] border ${toneStyle.border} ${toneStyle.glow} ${className}`}>
      {/* Base color wash */}
      <div className={`pointer-events-none absolute inset-0 ${toneStyle.wash}`} />

      {/* Fine paper fiber — primary dot lattice, simulates cellulose grain */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.055] mix-blend-screen bg-[radial-gradient(circle_at_8%_14%,rgba(255,255,255,0.9)_0.7px,transparent_1px),radial-gradient(circle_at_74%_68%,rgba(255,255,255,0.75)_0.7px,transparent_1px)] bg-[size:7px_7px,9px_9px]" />

      {/* Coarser paper tooth — offset lattice prevents synthetic CSS-flat look */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.028] mix-blend-overlay bg-[radial-gradient(circle_at_33%_55%,rgba(255,255,255,0.8)_0.5px,transparent_1px),radial-gradient(circle_at_67%_22%,rgba(255,255,255,0.7)_0.6px,transparent_1px)] bg-[size:13px_11px,11px_17px]" />

      {/* Micro paper imperfections — irregular fiber clusters at organic spacing */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.016] mix-blend-overlay bg-[radial-gradient(circle_at_21%_38%,rgba(255,255,255,0.85)_0.4px,transparent_1px),radial-gradient(circle_at_63%_71%,rgba(255,255,255,0.7)_0.35px,transparent_1px),radial-gradient(circle_at_84%_19%,rgba(255,255,255,0.8)_0.45px,transparent_1px),radial-gradient(circle_at_47%_54%,rgba(255,255,255,0.65)_0.3px,transparent_1px)] bg-[size:23px_19px,17px_29px,31px_13px,19px_37px]" />

      {/* Page bow — subtle center convexity, paper arching toward viewer */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_44%,rgba(255,255,255,0.042),transparent_72%)]" />

      {/* Scanline halftone — horizontal ruled lines at print density */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.055)_0px,rgba(255,255,255,0.055)_1px,transparent_1px,transparent_4px)]" />

      {/* Vertical column grid — editorial column structure ghost */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.04)_0px,rgba(255,255,255,0.04)_1px,transparent_1px,transparent_24px)]" />

      {/* Inner border frame */}
      <div className="pointer-events-none absolute inset-[10px] rounded-[22px] border border-white/10" />

      {/* Top light strip — gloss coat on cover face */}
      <div className="pointer-events-none absolute inset-x-[14px] top-[14px] h-[10px] rounded-full bg-white/12 blur-[6px]" />

      {/* Secondary top sheen — wide soft diffusion */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40px] rounded-t-[28px] bg-gradient-to-b from-white/[0.07] to-transparent" />

      {/* Gutter spine line */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-white/20 to-transparent" />

      {/* Gutter depth — deep fold shadow at center crease */}
      <div className="pointer-events-none absolute inset-y-4 left-1/2 w-[72px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.62),rgba(0,0,0,0.22)_58%,transparent_78%)] blur-[10px]" />

      {/* Gutter ambient — wider fold shadow wash */}
      <div className="pointer-events-none absolute inset-y-5 left-1/2 w-[120px] -translate-x-1/2 bg-gradient-to-r from-transparent via-black/36 to-transparent" />

      {/* Left edge lighting */}
      <div className="pointer-events-none absolute inset-y-[8%] left-[12px] w-[8px] rounded-full bg-gradient-to-b from-white/20 via-white/0 to-white/14" />

      {/* Right edge lighting */}
      <div className="pointer-events-none absolute inset-y-[8%] right-[12px] w-[8px] rounded-full bg-gradient-to-b from-white/18 via-white/0 to-white/12" />

      {/* Fold shading — left half darkens toward spine */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[18%] bg-gradient-to-r from-black/20 to-transparent" />

      {/* Fold shading — right half darkens toward spine */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[18%] bg-gradient-to-l from-black/20 to-transparent" />

      {/* Bottom drop shadow */}
      <div className="pointer-events-none absolute bottom-[18px] left-[18px] right-[18px] h-[26px] rounded-full bg-black/40 blur-[14px]" />

      {/* Top vignette */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white/10 to-transparent" />

      {/* Bottom vignette */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />

      {/* Corner curl — bottom-left paper tension */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-[80px] w-[80px] bg-[radial-gradient(ellipse_at_0%_100%,rgba(0,0,0,0.38),transparent_70%)]" />

      {/* Corner curl — bottom-right paper tension */}
      <div className="pointer-events-none absolute bottom-0 right-0 h-[80px] w-[80px] bg-[radial-gradient(ellipse_at_100%_100%,rgba(0,0,0,0.38),transparent_70%)]" />

      {/* Page stack — variable edge thickness (asymmetric insets) with hairline separators */}
      {!closed ? (
        <>
          {/* Page 1 — slightly wider on right, simulating uneven page pressure */}
          <div
            className="pointer-events-none absolute rounded-full bg-[linear-gradient(180deg,rgba(250,245,232,0.86),rgba(212,198,166,0.90))] shadow-[0_2px_0_rgba(255,255,255,0.16),0_3px_6px_rgba(0,0,0,0.30)]"
            style={{ bottom: 14, left: 15, right: 17, height: 7 }}
          />
          {/* Hairline separation beneath page 1 */}
          <div
            className="pointer-events-none absolute bg-gradient-to-r from-transparent via-black/30 to-transparent"
            style={{ bottom: 13, left: 15, right: 17, height: 1 }}
          />
          {/* Page 2 */}
          <div
            className="pointer-events-none absolute rounded-full bg-[linear-gradient(180deg,rgba(246,241,227,0.78),rgba(196,184,155,0.84))] shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
            style={{ bottom: 9, left: 20, right: 24, height: 6 }}
          />
          {/* Hairline separation beneath page 2 */}
          <div
            className="pointer-events-none absolute bg-gradient-to-r from-transparent via-black/24 to-transparent"
            style={{ bottom: 8, left: 20, right: 24, height: 1 }}
          />
          {/* Page 3 */}
          <div
            className="pointer-events-none absolute rounded-full bg-[linear-gradient(180deg,rgba(235,228,208,0.68),rgba(171,160,137,0.82))] shadow-[0_1px_3px_rgba(0,0,0,0.22)]"
            style={{ bottom: 5, left: 28, right: 32, height: 5 }}
          />
          {/* Hairline separation beneath page 3 */}
          <div
            className="pointer-events-none absolute bg-gradient-to-r from-transparent via-black/18 to-transparent"
            style={{ bottom: 4, left: 28, right: 32, height: 1 }}
          />
          {/* Page 4 — narrowest, deepest */}
          <div
            className="pointer-events-none absolute rounded-full bg-[linear-gradient(180deg,rgba(218,209,188,0.52),rgba(148,140,120,0.70))]"
            style={{ bottom: 2, left: 38, right: 42, height: 4 }}
          />
        </>
      ) : null}

      <div className={`relative z-[1] ${closed ? "min-h-[280px]" : "min-h-[520px]"}`}>{children}</div>
    </section>
  );
}

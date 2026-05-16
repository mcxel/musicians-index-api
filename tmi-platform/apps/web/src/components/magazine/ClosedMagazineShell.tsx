import type { ReactNode } from "react";
import MagazineFrameLayer from "@/components/magazine/MagazineFrameLayer";

interface ClosedMagazineShellProps {
  title?: string;
  subtitle?: string;
  tone?: "cyan" | "fuchsia" | "emerald" | "amber" | "violet";
  className?: string;
  children?: ReactNode;
}

export default function ClosedMagazineShell({
  title = "TMI Magazine Shell",
  subtitle = "Preparing the next spread...",
  tone = "fuchsia",
  className = "",
  children,
}: ClosedMagazineShellProps) {
  return (
    <div className={`mx-auto w-full max-w-[1080px] px-4 ${className}`}>
      <MagazineFrameLayer tone={tone} closed>
        <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden px-6 py-10">
          {/* Stacked pages — variable inset simulating uneven page pressure */}
          <div className="absolute rounded-[26px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(0,0,0,0.30))] shadow-[0_20px_64px_rgba(0,0,0,0.48),0_6px_0_rgba(255,255,255,0.04)]" style={{ top: 24, left: "10%", right: "9.5%" }} />
          <div className="absolute rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(26,18,36,0.98),rgba(8,7,16,0.98))] shadow-[0_0_44px_rgba(217,70,239,0.14),0_4px_0_rgba(0,0,0,0.4)]" style={{ top: 40, left: "13%", right: "12.5%", height: 198 }} />
          <div className="absolute rounded-[22px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(19,13,29,0.98),rgba(9,8,18,0.98))]" style={{ top: 46, left: "15.5%", right: "15%", height: 188 }} />

          {/* Page bow on cover — center convexity */}
          <div className="pointer-events-none absolute rounded-[22px] bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,rgba(255,255,255,0.038),transparent_70%)]" style={{ top: 46, left: "15.5%", right: "15%", height: 188 }} />

          {/* Micro imperfections on cover surface */}
          <div className="pointer-events-none absolute opacity-[0.012] mix-blend-overlay bg-[radial-gradient(circle_at_28%_34%,rgba(255,255,255,0.8)_0.4px,transparent_1px),radial-gradient(circle_at_71%_62%,rgba(255,255,255,0.7)_0.35px,transparent_1px)] bg-[size:21px_17px,15px_25px]" style={{ top: 46, left: "15.5%", right: "15%", height: 188 }} />

          {/* Spine edges — variable asymmetric insets with hairline separators */}
          <div className="absolute rounded-full bg-[linear-gradient(180deg,rgba(238,230,212,0.78),rgba(172,160,138,0.86))] shadow-[0_2px_4px_rgba(0,0,0,0.40)]" style={{ top: 232, left: "12%", right: "11.5%", height: 9 }} />
          <div className="absolute bg-gradient-to-r from-transparent via-black/28 to-transparent" style={{ top: 241, left: "12%", right: "11.5%", height: 1 }} />

          <div className="absolute rounded-full bg-[linear-gradient(180deg,rgba(225,218,198,0.66),rgba(149,140,121,0.80))] shadow-[0_1px_3px_rgba(0,0,0,0.30)]" style={{ top: 242, left: "14%", right: "13.5%", height: 7 }} />
          <div className="absolute bg-gradient-to-r from-transparent via-black/22 to-transparent" style={{ top: 249, left: "14%", right: "13.5%", height: 1 }} />

          <div className="absolute rounded-full bg-[linear-gradient(180deg,rgba(208,200,180,0.52),rgba(130,123,105,0.70))]" style={{ top: 250, left: "17%", right: "16.5%", height: 5 }} />
          <div className="absolute bg-gradient-to-r from-transparent via-black/16 to-transparent" style={{ top: 255, left: "17%", right: "16.5%", height: 1 }} />

          <div className="absolute rounded-full bg-[linear-gradient(180deg,rgba(188,180,158,0.38),rgba(110,104,88,0.58))]" style={{ top: 256, left: "21%", right: "20.5%", height: 4 }} />

          {/* Drop shadow beneath full stack */}
          <div className="absolute inset-x-[20%] top-[260px] h-[14px] rounded-full bg-black/48 blur-[10px]" />

          {/* Corner curl — bottom-left of cover */}
          <div className="pointer-events-none absolute bottom-[44px] h-[36px] w-[36px] bg-[radial-gradient(ellipse_at_0%_100%,rgba(0,0,0,0.42),transparent_78%)]" style={{ left: "15%" }} />

          {/* Corner curl — bottom-right of cover */}
          <div className="pointer-events-none absolute bottom-[44px] h-[36px] w-[36px] bg-[radial-gradient(ellipse_at_100%_100%,rgba(0,0,0,0.42),transparent_78%)]" style={{ right: "15%" }} />

          {children ? (
            <div className="relative z-[2] h-full w-full">{children}</div>
          ) : (
            <div className="relative z-[2] text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/55">Closed Magazine Shell</p>
              <h2 className="mt-3 text-2xl font-black uppercase tracking-tight text-white md:text-3xl">{title}</h2>
              <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-zinc-400">{subtitle}</p>
            </div>
          )}
        </div>
      </MagazineFrameLayer>
    </div>
  );
}

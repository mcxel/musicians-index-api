import type { TmiMagazinePageMeta } from "@/lib/magazine/tmiMagazineMetadataModel";
import {
  type TmiMagazineVisualState,
} from "@/lib/magazine/tmiMagazineLayerModel";
import { getMagazinePageColorPreset } from "@/lib/magazine/tmiMagazinePageColorPresets";
import { getSectionColor } from "@/lib/magazine/tmiMagazineSectionColors";
import { getMoodPreset } from "@/lib/magazine/tmiMagazinePageMoodPresets";
import { getPaperPreset } from "@/lib/magazine/tmiMagazinePaperPresets";
import { TMI_MAGAZINE_Z_INDEX } from "@/lib/magazine/tmiMagazineZIndex";

type Props = {
  state: TmiMagazineVisualState;
  page: TmiMagazinePageMeta;
  presetId?: string;
  className?: string;
};

export default function TmiMagazinePageSkeleton({ state, page, presetId = "default", className }: Props) {
  const colors = getMagazinePageColorPreset(presetId);
  const sectionColor = getSectionColor(page.pageType === "cover" ? "cover" : "ranking");
  const mood = getMoodPreset("neon-crown");
  const paper = getPaperPreset("default");
  const bookLayer = TMI_MAGAZINE_Z_INDEX.bookShell;
  const pageLayer = TMI_MAGAZINE_Z_INDEX.pageSkeleton;

  const closed = state === "closedIdle";
  const searching = state === "searchTransition";
  const isHomeCover = page.route === "/home/1";
  const suppressSpreadLabels = presetId === "home-2";

  return (
    <div className={["relative h-full min-h-[520px] overflow-hidden rounded-xl", className ?? ""].join(" ")}>
      <div className="pointer-events-none absolute inset-0" style={{ zIndex: bookLayer }}>
        <div
          className={[
            "absolute left-1/2 top-1/2 h-[90%] w-[94%] -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-white/20",
            "shadow-[0_28px_80px_rgba(0,0,0,0.62)]",
            closed ? "scale-100" : "scale-[1.015]",
            searching ? "animate-pulse" : "",
          ].join(" ")}
          style={{
            background: `linear-gradient(180deg, ${sectionColor.panel}, rgba(5,8,16,0.95))`,
          }}
        />
        <div className="absolute left-1/2 top-[6%] h-[88%] w-[12px] -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-300/45 via-fuchsia-300/35 to-yellow-300/45 shadow-[0_0_24px_rgba(56,189,248,0.35)]" />
        <div className="absolute left-[4%] top-[8%] h-[84%] w-[3px] rounded bg-white/25" />
        <div className="absolute right-[4%] top-[8%] h-[84%] w-[3px] rounded bg-white/20" />
      </div>

      <div className="absolute inset-0" style={{ zIndex: pageLayer }}>
        {closed ? (
          <div
            className="absolute left-1/2 top-1/2 h-[84%] w-[90%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-cyan-200/25"
            style={{
              background: page.backgroundImage
                ? `linear-gradient(180deg, rgba(7,10,20,0.35), rgba(6,9,16,0.7)), url(${page.backgroundImage}) center/cover no-repeat`
                : colors.rightPage,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/12 via-transparent to-fuchsia-300/12" />
            <div className="absolute inset-0 opacity-55" style={{ background: paper.paperTexture }} />
            {isHomeCover ? (
              <>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(46,183,255,0.25),transparent_26%),radial-gradient(circle_at_84%_20%,rgba(255,60,204,0.22),transparent_24%),radial-gradient(circle_at_50%_74%,rgba(255,213,0,0.16),transparent_30%)]" />
                <div className="absolute left-[10%] top-[25%] h-24 w-24 rounded-full border border-cyan-200/45 bg-gradient-to-br from-cyan-300/30 to-fuchsia-400/25" />
                <div className="absolute right-[14%] top-[30%] h-24 w-24 rounded-full border border-fuchsia-200/45 bg-gradient-to-br from-fuchsia-300/30 to-yellow-300/25" />
                <div className="absolute left-[40%] top-[34%] rounded-full border border-yellow-200/65 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-yellow-100 shadow-[0_0_22px_rgba(250,204,21,0.35)]">
                  Crown
                </div>
                <div className="absolute bottom-[13%] left-1/2 -translate-x-1/2 rounded border border-fuchsia-200/45 bg-black/35 px-4 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-fuchsia-100">
                  Weekly Cyphers!
                </div>
              </>
            ) : null}
          </div>
        ) : (
          <div className="absolute left-1/2 top-1/2 flex h-[84%] w-[90%] -translate-x-1/2 -translate-y-1/2 gap-[2px]">
            <article className="relative w-1/2 overflow-hidden rounded-l-lg border border-white/20" style={{ background: colors.leftPage, borderColor: paper.border }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-black/20" />
              <div className="absolute inset-0 opacity-50" style={{ background: paper.paperTexture }} />
              {!suppressSpreadLabels ? (
                <>
                  <div className="absolute inset-x-3 top-10 h-16 rounded border border-white/15" style={{ background: sectionColor.panel }} />
                  <div className="absolute left-3 top-3 rounded border border-white/20 bg-black/35 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">
                    Left Page
                  </div>
                  <div className="absolute bottom-3 left-3 rounded px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em]" style={{ background: sectionColor.accent, color: "#1b1420" }}>
                    Playlist Zone
                  </div>
                </>
              ) : null}
            </article>
            <article className="relative w-1/2 overflow-hidden rounded-r-lg border border-white/20" style={{ background: colors.rightPage, borderColor: paper.border }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />
              <div className="absolute inset-0 opacity-50" style={{ background: paper.paperTexture }} />
              {!suppressSpreadLabels ? (
                <>
                  <div className="absolute inset-x-3 top-10 h-16 rounded border border-white/15" style={{ background: sectionColor.panel }} />
                  <div className="absolute right-3 top-3 rounded border border-white/20 bg-black/35 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-fuchsia-100">
                    Right Page
                  </div>
                  <div className="absolute bottom-3 right-3 rounded px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em]" style={{ background: colors.accent, color: "#1b1420" }}>
                    Article Slot
                  </div>
                </>
              ) : null}
            </article>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0" style={{ zIndex: pageLayer + 1 }}>
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle_at_50%_50%,${mood.glow},transparent 58%)` }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${mood.atmosphere}, transparent 60%)` }} />
      </div>
    </div>
  );
}

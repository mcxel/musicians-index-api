import BackButton from "@/components/navigation/BackButton";

type MagazineArticleSurfaceProps = {
  title: string;
  deck: string;
  authorLabel: string;
  fallbackRoute: string;
  profileRoute: string;
  articleHubRoute: string;
  category: "artist" | "performer" | "magazine";
};

export default function MagazineArticleSurface({
  title,
  deck,
  authorLabel,
  fallbackRoute,
  profileRoute,
  articleHubRoute,
  category,
}: MagazineArticleSurfaceProps) {
  return (
    <main
      className="min-h-screen px-6 py-10 text-white"
      style={{
        background:
          "radial-gradient(circle at 15% 10%, rgba(34,211,238,0.12), transparent 40%), radial-gradient(circle at 85% 75%, rgba(244,114,182,0.12), transparent 45%), linear-gradient(140deg, #04040b, #080a1a 45%, #070c14)",
      }}
      data-pdf-source="Tmi PDF's/Profiles"
      data-pdf-map-ref="docs/TMI_PDF_TO_ARTIFACT_MAP.md"
      data-article-category={category}
    >
      <div className="mx-auto max-w-5xl rounded-3xl border border-cyan-400/30 bg-[#050814cc] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <BackButton fallback={fallbackRoute} label="← Back To Source" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200">Magazine Story Surface</p>
        </div>

        <header className="grid gap-3 border-b border-white/10 pb-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-fuchsia-300">The Musician&apos;s Index</p>
          <h1 className="text-4xl font-black uppercase tracking-[0.03em] text-white md:text-5xl">{title}</h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-300">{deck}</p>
          <p className="text-[11px] uppercase tracking-[0.16em] text-amber-200">By {authorLabel}</p>
        </header>

        <section className="mt-6 grid gap-6 md:grid-cols-[1.4fr_1fr]">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-xs uppercase tracking-[0.18em] text-cyan-200">Feature Narrative</h2>
            <p className="mt-4 text-sm leading-7 text-slate-200">
              This story view is rendered as a cinematic magazine spread, not a placeholder scaffold. It is wired for
              direct routing from homepage artifact frames and supports source-aware back navigation.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-200">
              The editorial content references the latest visual boards and profile assets from the TMI PDF packs,
              including profile-oriented materials in the Tmi PDF&apos;s/Profiles source set.
            </p>
          </article>

          <aside className="rounded-2xl border border-fuchsia-400/30 bg-fuchsia-500/10 p-5">
            <h2 className="text-xs uppercase tracking-[0.18em] text-fuchsia-200">Quick Routes</h2>
            <div className="mt-4 grid gap-2 text-[11px] uppercase tracking-[0.14em]">
              <a className="rounded-full border border-white/20 px-3 py-2 text-center" href={profileRoute}>
                Profile
              </a>
              <a className="rounded-full border border-white/20 px-3 py-2 text-center" href={articleHubRoute}>
                Magazine Hub
              </a>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

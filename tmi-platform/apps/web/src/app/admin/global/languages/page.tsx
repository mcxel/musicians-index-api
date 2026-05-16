import { getAllLanguages } from "@/lib/global/LanguageAssistEngine";
import { getAllCaptionLanguages } from "@/lib/captions/CaptionLanguageSelector";
import Link from "next/link";

export default function AdminGlobalLanguagesPage() {
  const profiles = getAllLanguages();
  const captionLanguages = getAllCaptionLanguages();

  const supportedForTranslation = profiles.filter(p => p.translationSupported).length;
  const supportedForCaptions = captionLanguages.filter(l => l.available).length;

  return (
    <main className="min-h-screen" style={{ background: "#060410", color: "#fff" }}>
      <div className="px-6 pt-10 pb-6 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <Link href="/admin/global" className="text-xs text-white/30 hover:text-white/60 mb-4 block">← Global Admin</Link>
          <h1 className="text-2xl font-bold" style={{ color: "#00FFFF" }}>Language Coverage</h1>
          <p className="text-sm text-white/40 mt-1">
            {supportedForTranslation} translation · {supportedForCaptions} caption languages active
          </p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <section>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">Language Profiles</h2>
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <th className="text-left px-4 py-3 text-xs text-white/40 font-normal">Code</th>
                  <th className="text-left px-4 py-3 text-xs text-white/40 font-normal">Language</th>
                  <th className="text-center px-4 py-3 text-xs text-white/40 font-normal">Translation</th>
                  <th className="text-center px-4 py-3 text-xs text-white/40 font-normal">Captions</th>
                  <th className="text-left px-4 py-3 text-xs text-white/40 font-normal">Flag</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map(p => (
                  <tr key={p.code} className="border-b border-white/5">
                    <td className="px-4 py-3 font-mono text-white/70">{p.code.toUpperCase()}</td>
                    <td className="px-4 py-3 text-white">{p.name}</td>
                    <td className="px-4 py-3 text-center">
                      {p.translationSupported
                        ? <span className="text-green-400 text-xs">✓</span>
                        : <span className="text-white/20 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.captionSupported
                        ? <span className="text-purple-400 text-xs">✓</span>
                        : <span className="text-white/20 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs">{p.flag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">Caption Language Availability</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {captionLanguages.map(lang => (
              <div
                key={lang.code}
                className="rounded-lg p-3 flex items-center justify-between"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${lang.available ? "rgba(170,45,255,0.3)" : "rgba(255,255,255,0.07)"}`,
                }}
              >
                <div>
                  <div className="text-sm text-white">{lang.label}</div>
                  <div className="text-xs text-white/40">{lang.nativeLabel}</div>
                </div>
                <span className={`text-xs font-mono ${lang.available ? "text-purple-400" : "text-white/20"}`}>
                  {lang.available ? "ON" : "soon"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

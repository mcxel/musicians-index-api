import { getAllCaptionLanguages } from "@/lib/captions/CaptionLanguageSelector";
import { getCaptionSupportedLanguages } from "@/lib/global/LanguageAssistEngine";
import Link from "next/link";

export default function AdminGlobalCaptionsPage() {
  const captionLanguages = getAllCaptionLanguages();
  const fullySupported = getCaptionSupportedLanguages();
  const availableCount = captionLanguages.filter(l => l.available).length;

  return (
    <main className="min-h-screen" style={{ background: "#060410", color: "#fff" }}>
      <div className="px-6 pt-10 pb-6 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <Link href="/admin/global" className="text-xs text-white/30 hover:text-white/60 mb-4 block">← Global Admin</Link>
          <h1 className="text-2xl font-bold" style={{ color: "#AA2DFF" }}>Caption System</h1>
          <p className="text-sm text-white/40 mt-1">
            {availableCount} of {captionLanguages.length} caption languages active · {fullySupported.length} fully supported
          </p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Status bar */}
        <div className="rounded-xl p-4" style={{ background: "rgba(170,45,255,0.08)", border: "1px solid rgba(170,45,255,0.2)" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/70">Caption Coverage</span>
            <span className="text-sm font-mono" style={{ color: "#AA2DFF" }}>
              {Math.round((availableCount / captionLanguages.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div
              className="h-2 rounded-full"
              style={{ width: `${(availableCount / captionLanguages.length) * 100}%`, background: "#AA2DFF" }}
            />
          </div>
        </div>

        {/* Language grid */}
        <section>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">All Caption Languages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {captionLanguages.map(lang => (
              <div
                key={lang.code}
                className="rounded-lg p-4 flex items-center justify-between"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${lang.available ? "rgba(170,45,255,0.3)" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                <div>
                  <div className="text-sm font-semibold text-white">{lang.label}</div>
                  <div className="text-xs text-white/40">{lang.nativeLabel} · {lang.code.toUpperCase()}</div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-mono ${lang.available ? "text-purple-400" : "text-white/20"}`}>
                    {lang.available ? "● ACTIVE" : "○ PENDING"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Fully supported */}
        <section>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">Fully Caption-Ready</h2>
          <div className="flex flex-wrap gap-2">
            {fullySupported.map(lang => (
              <span
                key={lang.code}
                className="px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5"
                style={{ background: "rgba(170,45,255,0.12)", border: "1px solid rgba(170,45,255,0.3)", color: "#AA2DFF" }}
              >
                {lang.flag} {lang.name}
              </span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

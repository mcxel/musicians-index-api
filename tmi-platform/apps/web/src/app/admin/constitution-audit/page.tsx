import fs from 'fs';
import path from 'path';
import Link from 'next/link';

// ── Surface definition ────────────────────────────────────────────────────────

interface Surface {
  name: string;
  route: string;
  filePath: string;
  type: 'home' | 'article' | 'profile' | 'live' | 'venue' | 'sponsor';
  /** Additional component files to check (transitive imports) */
  componentPaths?: string[];
}

const WEB = path.join(process.cwd(), 'src');

const SURFACES: Surface[] = [
  {
    name: 'Home 1 — The Crown',
    route: '/home/1',
    filePath: 'app/home/1/page.tsx',
    type: 'home',
    componentPaths: ['components/home/Home1CoverPage.tsx'],
  },
  {
    name: 'Home 1-2 — Billboard',
    route: '/home/1-2',
    filePath: 'app/home/1-2/page.tsx',
    type: 'home',
  },
  {
    name: 'Home 2 — Magazine',
    route: '/home/2',
    filePath: 'app/home/2/page.tsx',
    type: 'home',
  },
  {
    name: 'Home 3 — Live World',
    route: '/home/3',
    filePath: 'app/home/3/page.tsx',
    type: 'home',
  },
  {
    name: 'Home 4 — Marketplace',
    route: '/home/4',
    filePath: 'app/home/4/page.tsx',
    type: 'home',
  },
  {
    name: 'Home 5 — Arena',
    route: '/home/5',
    filePath: 'app/home/5/page.tsx',
    type: 'home',
  },
  {
    name: 'Performer Article',
    route: '/articles/performer/[slug]',
    filePath: 'app/articles/performer/[slug]/page.tsx',
    type: 'article',
  },
  {
    name: 'Magazine Article',
    route: '/magazine/article/[slug]',
    filePath: 'app/magazine/article/[slug]/page.tsx',
    type: 'article',
  },
  {
    name: 'Performer Profile',
    route: '/performers/[slug]',
    filePath: 'app/performers/[slug]/page.tsx',
    type: 'profile',
  },
  {
    name: 'Live Room',
    route: '/live/rooms/[id]',
    filePath: 'app/live/rooms/[id]/page.tsx',
    type: 'live',
  },
  {
    name: 'Venue Page',
    route: '/venues/[slug]',
    filePath: 'app/venues/[slug]/page.tsx',
    type: 'venue',
  },
  {
    name: 'Sponsor Page',
    route: '/sponsors/[slug]',
    filePath: 'app/sponsors/[slug]/page.tsx',
    type: 'sponsor',
  },
];

// ── Constitutional checks ─────────────────────────────────────────────────────

interface Check {
  id: string;
  rule: string;
  label: string;
  patterns: RegExp[];
  appliesTo: Surface['type'][];
  priority: 'P0' | 'P1' | 'P2';
}

const CHECKS: Check[] = [
  {
    id: 'registry',
    rule: 'R1',
    label: 'Registry Source',
    patterns: [/PerformerRegistry|VenueRegistry|getPerformerBySlug|PERFORMER_REGISTRY|magazineIssueData/],
    appliesTo: ['home', 'article', 'profile', 'live', 'venue'],
    priority: 'P0',
  },
  {
    id: 'live_first',
    rule: 'R2',
    label: 'Live First',
    patterns: [/isLive|liveRoom|LIVE NOW|audienceCount/],
    appliesTo: ['home', 'article', 'profile', 'live', 'venue'],
    priority: 'P0',
  },
  {
    id: 'discovery_rail',
    rule: 'R6',
    label: 'Discovery Rail',
    patterns: [/DiscoveryRail/],
    appliesTo: ['home', 'article', 'profile', 'venue', 'sponsor'],
    priority: 'P0',
  },
  {
    id: 'freshness',
    rule: 'R11',
    label: 'Content Freshness',
    patterns: [/ContentFreshness|sortByFreshness|sortPerformersByFreshness|LIVE.*RECENT|FRESHNESS/],
    appliesTo: ['home'],
    priority: 'P1',
  },
  {
    id: 'ad_slot',
    rule: 'R12',
    label: 'No Empty Inventory',
    patterns: [/getAdSlotForZone|getActiveSponsorForZone/],
    appliesTo: ['home', 'article', 'venue', 'sponsor'],
    priority: 'P1',
  },
  {
    id: 'article_hub',
    rule: 'R13',
    label: 'Article Hub',
    patterns: [/fan.club|fanClub|checkout\/tip|send.tip|merch/i],
    appliesTo: ['article'],
    priority: 'P0',
  },
];

// ── Compliance check runner ───────────────────────────────────────────────────

type CheckResult = 'PASS' | 'FAIL' | 'N/A' | 'MISSING';

interface SurfaceResult {
  surface: Surface;
  exists: boolean;
  checks: Record<string, CheckResult>;
  score: number;
  maxScore: number;
}

function readSource(filePath: string): string {
  const full = path.join(WEB, filePath);
  try {
    return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : '';
  } catch {
    return '';
  }
}

function auditSurface(surface: Surface): SurfaceResult {
  const mainSource = readSource(surface.filePath);
  const exists = mainSource.length > 0;

  const componentSources = (surface.componentPaths ?? []).map(readSource);
  const allSource = [mainSource, ...componentSources].join('\n');

  const checks: Record<string, CheckResult> = {};
  let score = 0;
  let maxScore = 0;

  for (const check of CHECKS) {
    if (!check.appliesTo.includes(surface.type)) {
      checks[check.id] = 'N/A';
      continue;
    }
    if (!exists) {
      checks[check.id] = 'MISSING';
      continue;
    }
    maxScore++;
    const passes = check.patterns.some(p => p.test(allSource));
    checks[check.id] = passes ? 'PASS' : 'FAIL';
    if (passes) score++;
  }

  return { surface, exists, checks, score, maxScore };
}

// ── Repair queue ──────────────────────────────────────────────────────────────

interface RepairItem {
  surface: string;
  route: string;
  failures: { check: Check; rule: string }[];
}

function buildRepairQueue(results: SurfaceResult[]): RepairItem[] {
  return results
    .filter(r => r.exists && r.score < r.maxScore)
    .map(r => ({
      surface: r.surface.name,
      route: r.surface.route,
      failures: CHECKS
        .filter(c => r.checks[c.id] === 'FAIL')
        .sort((a, b) => (a.priority < b.priority ? -1 : 1))
        .map(c => ({ check: c, rule: c.rule })),
    }))
    .sort((a, b) => b.failures.filter(f => f.check.priority === 'P0').length - a.failures.filter(f => f.check.priority === 'P0').length);
}

// ── Page ─────────────────────────────────────────────────────────────────────

export const metadata = { title: 'Constitution Audit — TMI Admin' };

export default function ConstitutionAuditPage() {
  const results = SURFACES.map(auditSurface);
  const repairQueue = buildRepairQueue(results);

  const totalChecks = results.reduce((s, r) => s + r.maxScore, 0);
  const totalPassing = results.reduce((s, r) => s + r.score, 0);
  const overallPct = totalChecks > 0 ? Math.round((totalPassing / totalChecks) * 100) : 0;

  const RESULT_COLOR: Record<CheckResult, string> = {
    PASS:    '#00FF88',
    FAIL:    '#FF2DAA',
    'N/A':   '#333355',
    MISSING: '#FF6B35',
  };

  const RESULT_ICON: Record<CheckResult, string> = {
    PASS: '✅', FAIL: '❌', 'N/A': '—', MISSING: '⚠️',
  };

  const PRIORITY_COLOR: Record<string, string> = { P0: '#FF2DAA', P1: '#FFD700', P2: '#00E5FF' };

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #050510 0%, #0a0614 100%)', color: '#fff', fontFamily: "'Inter', sans-serif", padding: '24px 20px 80px' }}>

      {/* ── Header ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <Link href="/admin/overview" style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontWeight: 700, letterSpacing: '0.1em' }}>← ADMIN</Link>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>/</span>
          <span style={{ fontSize: 9, color: '#00E5FF', fontWeight: 700, letterSpacing: '0.1em' }}>CONSTITUTION AUDIT</span>
        </div>
        <h1 style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 900, margin: '0 0 4px', background: 'linear-gradient(135deg, #fff 40%, #00E5FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          TMI Platform Constitution v1.0
        </h1>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 24px' }}>
          Live compliance audit — checks actual source files against 13 constitutional rules
        </p>

        {/* Overall score */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'OVERALL COMPLIANCE', value: `${overallPct}%`, color: overallPct >= 80 ? '#00FF88' : overallPct >= 50 ? '#FFD700' : '#FF2DAA' },
            { label: 'CHECKS PASSING', value: `${totalPassing} / ${totalChecks}`, color: '#00E5FF' },
            { label: 'SURFACES NEEDING REPAIR', value: String(repairQueue.length), color: repairQueue.length === 0 ? '#00FF88' : '#FF2DAA' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}22`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color, marginBottom: 3 }}>{s.value}</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Compliance matrix ── */}
        <div style={{ marginBottom: 32, overflowX: 'auto' }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: '#00E5FF', letterSpacing: '0.2em', marginBottom: 10 }}>COMPLIANCE MATRIX</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 8, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.1em', width: 200 }}>SURFACE</th>
                {CHECKS.map(c => (
                  <th key={c.id} style={{ textAlign: 'center', padding: '8px 6px', fontSize: 7, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                    <div style={{ color: '#00E5FF', fontWeight: 900, fontSize: 8 }}>{c.rule}</div>
                    <div>{c.label}</div>
                  </th>
                ))}
                <th style={{ textAlign: 'center', padding: '8px 6px', fontSize: 8, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>SCORE</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => {
                const pct = r.maxScore > 0 ? Math.round((r.score / r.maxScore) * 100) : 100;
                const rowColor = pct === 100 ? '#00FF8811' : pct >= 66 ? '#FFD70008' : '#FF2DAA08';
                return (
                  <tr key={r.surface.route} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: rowColor }}>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{r.surface.name}</div>
                      <Link href={r.surface.route} style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.06em' }}>
                        {r.surface.route}
                      </Link>
                    </td>
                    {CHECKS.map(c => {
                      const res = r.checks[c.id] ?? 'N/A';
                      return (
                        <td key={c.id} style={{ textAlign: 'center', padding: '10px 6px' }}>
                          <span
                            title={res}
                            style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: 24, height: 24, borderRadius: 6,
                              background: `${RESULT_COLOR[res]}18`,
                              border: `1px solid ${RESULT_COLOR[res]}44`,
                              fontSize: 11,
                            }}
                          >
                            {RESULT_ICON[res]}
                          </span>
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                      <div style={{ fontSize: 13, fontWeight: 900, color: pct === 100 ? '#00FF88' : pct >= 66 ? '#FFD700' : '#FF2DAA' }}>
                        {r.maxScore > 0 ? `${pct}%` : 'N/A'}
                      </div>
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>{r.score}/{r.maxScore}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
            {Object.entries(RESULT_ICON).map(([k, icon]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
                {icon} <span>{k}</span>
              </div>
            ))}
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>
              Note: checks direct file imports. Transitive imports via sub-components may also satisfy rules.
            </div>
          </div>
        </div>

        {/* ── Priority repair queue ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: '#FF2DAA', letterSpacing: '0.2em', marginBottom: 10 }}>PRIORITY REPAIR QUEUE</div>
          {repairQueue.length === 0 ? (
            <div style={{ padding: '20px', background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 10, fontSize: 13, color: '#00FF88', fontWeight: 700 }}>
              ✅ All surfaces fully compliant
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {repairQueue.map((item, i) => (
                <div key={item.route} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,45,170,0.12)', border: '1px solid rgba(255,45,170,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#FF2DAA', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 900, color: '#fff' }}>{item.surface}</span>
                      <Link href={item.route} style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.06em' }}>{item.route}</Link>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {item.failures.map(f => (
                        <span key={f.check.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: `${PRIORITY_COLOR[f.check.priority]}14`, border: `1px solid ${PRIORITY_COLOR[f.check.priority]}44`, borderRadius: 6, fontSize: 8, fontWeight: 700, color: PRIORITY_COLOR[f.check.priority], letterSpacing: '0.06em' }}>
                          {f.check.priority} · {f.check.rule} {f.check.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Rule legend ── */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: '#00E5FF', letterSpacing: '0.2em', marginBottom: 12 }}>CONSTITUTION v1.0 — RULE INDEX</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
            {[
              ['Tier',  'FREE→PRO→RUBY→SILVER→GOLD→PLATINUM→DIAMOND'],
              ['R1',   'Upload Pipeline — Dashboard→Registry→everywhere'],
              ['R2',   'Media Priority — LIVE→Motion Poster→Static Image'],
              ['R3',   'XP-Driven Rankings — computeRanks(), never manual'],
              ['R4',   'Crown Rotation — 2mo overall / 1mo genre'],
              ['R5',   'Home Structure — 1=Crown, 1-2=Billboard, 2=Mag, 3=Live, 4=Market, 5=Arena'],
              ['R6',   'Discovery Rails — mandatory, no dead ends'],
              ['R7',   'Visual Canon — dark purple + neon, Images 77/78/84/85'],
              ['R8',   'Registry First — pages consume, registries own'],
              ['R9',   'Everything Earns XP — XpActionRegistry.ts'],
              ['R10',  'Platform Identity — Magazine+Billboard+Live+Competition+Market+Rankings+Social'],
              ['R11',  'Content Freshness — LIVE→RECENT→POPULAR→ARCHIVE'],
              ['R12',  'No Empty Inventory — Paid→Platform→AdNetwork→Advertise CTA'],
              ['R13',  'Every Article Is A Hub — article+preview+live+merch+tip+fanclub+discovery'],
            ].map(([rule, desc]) => (
              <div key={rule} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 8, fontWeight: 900, color: '#00E5FF', letterSpacing: '0.06em', flexShrink: 0, paddingTop: 1, minWidth: 30 }}>{rule}</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Planned v1.1 rules ── */}
        <div style={{ background: 'rgba(0,229,255,0.03)', border: '1px solid rgba(0,229,255,0.12)', borderRadius: 10, padding: '14px 18px' }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: '#00E5FF', letterSpacing: '0.2em', marginBottom: 8 }}>CONSTITUTION v1.1 — PLANNED (not yet enforced)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[
              ['R14', 'Event Memory — every meaningful event creates a Memory Wall entry'],
              ['R15', 'Discovery Reciprocity — every entity is discoverable from every other entity'],
              ['R16', 'Broadcast Quality — ESPN+NBA+NFL visual standard for all performer imagery'],
            ].map(([rule, desc]) => (
              <div key={rule} style={{ display: 'flex', gap: 8, fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
                <span style={{ fontWeight: 900, color: 'rgba(0,229,255,0.5)', minWidth: 30 }}>{rule}</span>
                <span>{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20, fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>
          LAST AUDITED: {new Date().toISOString().split('T')[0]} · READS LIVE SOURCE FILES · REFRESH PAGE TO RE-AUDIT
        </div>
      </div>
    </main>
  );
}

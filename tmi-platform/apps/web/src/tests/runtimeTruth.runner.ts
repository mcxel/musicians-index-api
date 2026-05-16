/**
 * runtimeTruth.runner.ts
 * Smoke-tests every critical route against a live or local server.
 * Run: npx ts-node src/tests/runtimeTruth.runner.ts [baseUrl]
 */

export interface RouteResult {
  path: string;
  status: number;
  pass: boolean;
  latencyMs: number;
  notes: string;
}

export interface TruthReport {
  baseUrl: string;
  timestamp: string;
  totalRoutes: number;
  passed: number;
  failed: number;
  results: RouteResult[];
}

interface RouteSpec {
  path: string;
  expectedStatus: number | number[];
  notes?: string;
}

const PUBLIC_ROUTES: RouteSpec[] = [
  { path: "/",                         expectedStatus: 200 },
  { path: "/home/1",                   expectedStatus: 200 },
  { path: "/home/2",                   expectedStatus: 200 },
  { path: "/login",                    expectedStatus: 200 },
  { path: "/signup",                   expectedStatus: 200 },
  { path: "/signup/teen",              expectedStatus: 200 },
  { path: "/account-recovery",         expectedStatus: 200 },
  { path: "/shows",                    expectedStatus: 200 },
  { path: "/shows/monthly-idol",       expectedStatus: 200 },
  { path: "/shows/monday-night-stage", expectedStatus: 200 },
  { path: "/events",                   expectedStatus: 200 },
  { path: "/artists",                  expectedStatus: 200 },
  { path: "/venues",                   expectedStatus: 200 },
  { path: "/battles",                  expectedStatus: 200 },
  { path: "/magazine",                 expectedStatus: 200 },
  { path: "/live",                     expectedStatus: 200 },
  { path: "/parents",                  expectedStatus: 200 },
];

const AUTH_GUARDED_ROUTES: RouteSpec[] = [
  { path: "/lobbies",           expectedStatus: [200, 302, 307], notes: "redirect to login when unauthed" },
  { path: "/lobby",             expectedStatus: [200, 302, 307] },
  { path: "/rooms",             expectedStatus: [200, 302, 307] },
  { path: "/avatar",            expectedStatus: [200, 302, 307] },
  { path: "/avatar/build",      expectedStatus: [200, 302, 307] },
  { path: "/tickets",           expectedStatus: [200, 302, 307] },
  { path: "/wallet",            expectedStatus: [200, 302, 307] },
  { path: "/dashboard",         expectedStatus: [200, 302, 307] },
  { path: "/cypher",            expectedStatus: [200, 302, 307] },
];

const ADMIN_ROUTES: RouteSpec[] = [
  { path: "/admin",                 expectedStatus: [200, 302, 307, 403], notes: "admin-only" },
  { path: "/admin/route-health",    expectedStatus: [200, 302, 307, 403] },
  { path: "/admin/minor-safety",    expectedStatus: [200, 302, 307, 403] },
];

const SHOW_ROUTES: RouteSpec[] = [
  { path: "/shows/monthly-idol",       expectedStatus: 200 },
  { path: "/shows/monday-night-stage", expectedStatus: 200 },
  { path: "/beats/marketplace",        expectedStatus: 200 },
];

const VENUE_ROUTES: RouteSpec[] = [
  { path: "/venues",           expectedStatus: 200 },
];

const ALL_SPECS = [
  ...PUBLIC_ROUTES,
  ...AUTH_GUARDED_ROUTES,
  ...ADMIN_ROUTES,
  ...SHOW_ROUTES,
  ...VENUE_ROUTES,
];

async function checkRoute(
  baseUrl: string,
  spec: RouteSpec,
): Promise<RouteResult> {
  const url = `${baseUrl}${spec.path}`;
  const start = Date.now();
  try {
    const res = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "TMI-TruthRunner/1.0" },
    });
    const latencyMs = Date.now() - start;
    const expected = Array.isArray(spec.expectedStatus)
      ? spec.expectedStatus
      : [spec.expectedStatus];
    const pass = expected.includes(res.status);
    return {
      path: spec.path,
      status: res.status,
      pass,
      latencyMs,
      notes: spec.notes ?? "",
    };
  } catch (err: unknown) {
    return {
      path: spec.path,
      status: 0,
      pass: false,
      latencyMs: Date.now() - start,
      notes: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function runRuntimeTruth(baseUrl = "http://localhost:3000"): Promise<TruthReport> {
  const results: RouteResult[] = [];

  for (const spec of ALL_SPECS) {
    const result = await checkRoute(baseUrl, spec);
    results.push(result);
  }

  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;

  return {
    baseUrl,
    timestamp: new Date().toISOString(),
    totalRoutes: results.length,
    passed,
    failed,
    results,
  };
}

export function printTruthReport(report: TruthReport): void {
  const pad = (s: string, n: number) => s.padEnd(n);
  console.log("\n═══ RUNTIME TRUTH REPORT ═══════════════════════");
  console.log(`  Base URL : ${report.baseUrl}`);
  console.log(`  Time     : ${report.timestamp}`);
  console.log(`  Routes   : ${report.totalRoutes}  PASS: ${report.passed}  FAIL: ${report.failed}`);
  console.log("─────────────────────────────────────────────────");
  for (const r of report.results) {
    const icon = r.pass ? "✓" : "✗";
    const ms = `${r.latencyMs}ms`.padStart(7);
    const status = String(r.status).padStart(3);
    console.log(`  ${icon} ${status} ${ms}  ${pad(r.path, 42)} ${r.notes}`);
  }
  console.log("═════════════════════════════════════════════════");
  console.log(report.failed === 0 ? "  ALL PASS\n" : `  ${report.failed} FAILED\n`);
}

// CLI entry
if (require?.main === module || typeof process !== "undefined" && process.argv[1]?.includes("runtimeTruth")) {
  const baseUrl = process.argv[2] ?? "http://localhost:3000";
  runRuntimeTruth(baseUrl).then((report) => {
    printTruthReport(report);
    process.exit(report.failed > 0 ? 1 : 0);
  });
}

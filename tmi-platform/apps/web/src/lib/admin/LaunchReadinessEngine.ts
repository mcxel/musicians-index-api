/**
 * LaunchReadinessEngine
 * PASS/FAIL board for every critical system before production launch.
 */

export type ReadinessCategory =
  | "auth"
  | "payments"
  | "safety"
  | "routes"
  | "bots"
  | "shows"
  | "devices"
  | "admin"
  | "magazine"
  | "economy"
  | "deployment";

export type CheckStatus = "pass" | "fail" | "warn" | "pending" | "skipped";

export interface ReadinessCheck {
  id: string;
  category: ReadinessCategory;
  name: string;
  description: string;
  status: CheckStatus;
  detail?: string;
  blocksLaunch: boolean;
  checkedAt?: number;
  checkedBy?: string;
}

export interface CategoryResult {
  category: ReadinessCategory;
  pass: number;
  fail: number;
  warn: number;
  pending: number;
  blocking: boolean;
}

export interface LaunchReadinessReport {
  timestamp: string;
  overallStatus: "LAUNCH_READY" | "BLOCKED" | "WARNINGS" | "PENDING";
  launchBlockers: ReadinessCheck[];
  categories: CategoryResult[];
  checks: ReadinessCheck[];
  passPercent: number;
}

const REQUIRED_CHECKS: Omit<ReadinessCheck, "status" | "checkedAt" | "checkedBy" | "detail">[] = [
  // Auth
  { id: "auth-login",          category: "auth",       name: "Login flow",              description: "Users can log in",                       blocksLaunch: true },
  { id: "auth-signup",         category: "auth",       name: "Signup flow",             description: "All 6 roles can sign up",                blocksLaunch: true },
  { id: "auth-teen-signup",    category: "auth",       name: "Teen signup",             description: "Teen signup with guardian",              blocksLaunch: true },
  { id: "auth-session",        category: "auth",       name: "Session persistence",     description: "Sessions survive refresh",               blocksLaunch: true },
  // Payments
  { id: "pay-stripe",          category: "payments",   name: "Stripe checkout",         description: "Stripe checkout flow completes",         blocksLaunch: true },
  { id: "pay-webhook",         category: "payments",   name: "Stripe webhook",          description: "Webhook receives events",                blocksLaunch: true },
  { id: "pay-subscriptions",   category: "payments",   name: "Subscriptions",           description: "Fan/artist subscriptions activate",      blocksLaunch: true },
  // Safety
  { id: "safe-teen-dm",        category: "safety",     name: "Teen DM block",           description: "Teens cannot send DMs",                  blocksLaunch: true },
  { id: "safe-teen-voice",     category: "safety",     name: "Teen voice block",        description: "Teens cannot join voice rooms",          blocksLaunch: true },
  { id: "safe-teen-video",     category: "safety",     name: "Teen video block",        description: "Teens cannot join video rooms",          blocksLaunch: true },
  { id: "safe-guardian",       category: "safety",     name: "Guardian approval",       description: "Guardian approval required for purchase",blocksLaunch: true },
  { id: "safe-adult-block",    category: "safety",     name: "Adult-teen block",        description: "Adults cannot contact teens directly",   blocksLaunch: true },
  // Routes
  { id: "routes-public",       category: "routes",     name: "Public routes",           description: "All public routes return 200",           blocksLaunch: true },
  { id: "routes-auth",         category: "routes",     name: "Auth-guarded routes",     description: "Private routes redirect unauthenticated",blocksLaunch: true },
  { id: "routes-admin",        category: "routes",     name: "Admin routes",            description: "Admin routes block non-admins",          blocksLaunch: true },
  { id: "routes-count",        category: "routes",     name: "Route count",             description: "739+ routes build clean",                blocksLaunch: false },
  // Bots
  { id: "bots-registered",     category: "bots",       name: "62 bots registered",      description: "Minimum bot count active",               blocksLaunch: false },
  { id: "bots-julius",         category: "bots",       name: "Julius AI gateway",       description: "Julius responds to prompts",             blocksLaunch: false },
  // Shows
  { id: "shows-idol",          category: "shows",      name: "Monthly Idol engine",     description: "Round engine runs without errors",        blocksLaunch: false },
  { id: "shows-monday",        category: "shows",      name: "Monday Night Stage",      description: "Show runtime engine active",             blocksLaunch: false },
  // Devices
  { id: "device-foundation",   category: "devices",    name: "Device foundation",       description: "All 11 device classes configured",       blocksLaunch: false },
  { id: "device-handshake",    category: "devices",    name: "QR pairing",              description: "QR pairing token flow works",            blocksLaunch: false },
  // Admin
  { id: "admin-dashboard",     category: "admin",      name: "Admin dashboard",         description: "Marcel can see users and revenue",       blocksLaunch: true },
  { id: "admin-bots",          category: "admin",      name: "Bot observatory",         description: "Bot activity visible in admin",          blocksLaunch: false },
  // Deployment
  { id: "deploy-env",          category: "deployment", name: "Env vars set",            description: "All required env vars present",          blocksLaunch: true },
  { id: "deploy-build",        category: "deployment", name: "Build passes",            description: "pnpm build exits 0",                     blocksLaunch: true },
  { id: "deploy-ssr",          category: "deployment", name: "SSR works",               description: "Server-rendered pages respond",          blocksLaunch: true },
];

export class LaunchReadinessEngine {
  private static _instance: LaunchReadinessEngine | null = null;

  private _checks: Map<string, ReadinessCheck> = new Map();
  private _listeners: Set<(report: LaunchReadinessReport) => void> = new Set();

  static getInstance(): LaunchReadinessEngine {
    if (!LaunchReadinessEngine._instance) {
      LaunchReadinessEngine._instance = new LaunchReadinessEngine();
    }
    return LaunchReadinessEngine._instance;
  }

  constructor() {
    for (const check of REQUIRED_CHECKS) {
      this._checks.set(check.id, { ...check, status: "pending" });
    }
  }

  // ── Check management ──────────────────────────────────────────────────────

  setCheck(id: string, status: CheckStatus, detail?: string, checkedBy = "system"): void {
    const check = this._checks.get(id);
    if (!check) return;
    check.status = status;
    check.detail = detail;
    check.checkedAt = Date.now();
    check.checkedBy = checkedBy;
    this._emit();
  }

  passCheck(id: string, detail?: string): void {
    this.setCheck(id, "pass", detail);
  }

  failCheck(id: string, detail: string): void {
    this.setCheck(id, "fail", detail);
  }

  warnCheck(id: string, detail: string): void {
    this.setCheck(id, "warn", detail);
  }

  addCustomCheck(check: Omit<ReadinessCheck, "checkedAt" | "checkedBy">): void {
    this._checks.set(check.id, { ...check, status: check.status ?? "pending" });
  }

  // ── Report ─────────────────────────────────────────────────────────────────

  generateReport(): LaunchReadinessReport {
    const checks = [...this._checks.values()];
    const launchBlockers = checks.filter((c) => c.blocksLaunch && c.status === "fail");
    const passed = checks.filter((c) => c.status === "pass").length;

    const categoryMap = new Map<ReadinessCategory, CategoryResult>();
    for (const c of checks) {
      if (!categoryMap.has(c.category)) {
        categoryMap.set(c.category, { category: c.category, pass: 0, fail: 0, warn: 0, pending: 0, blocking: false });
      }
      const cat = categoryMap.get(c.category)!;
      if (c.status === "pass") cat.pass++;
      else if (c.status === "fail") { cat.fail++; if (c.blocksLaunch) cat.blocking = true; }
      else if (c.status === "warn") cat.warn++;
      else cat.pending++;
    }

    const overallStatus: LaunchReadinessReport["overallStatus"] =
      launchBlockers.length > 0 ? "BLOCKED"
      : checks.some((c) => c.status === "pending") ? "PENDING"
      : checks.some((c) => c.status === "warn") ? "WARNINGS"
      : "LAUNCH_READY";

    return {
      timestamp: new Date().toISOString(),
      overallStatus,
      launchBlockers,
      categories: [...categoryMap.values()],
      checks,
      passPercent: checks.length > 0 ? Math.round((passed / checks.length) * 100) : 0,
    };
  }

  getAllChecks(): ReadinessCheck[] {
    return [...this._checks.values()];
  }

  getBlockingFailures(): ReadinessCheck[] {
    return [...this._checks.values()].filter((c) => c.blocksLaunch && c.status === "fail");
  }

  // ── Subscription ──────────────────────────────────────────────────────────

  onChange(cb: (report: LaunchReadinessReport) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _emit(): void {
    const report = this.generateReport();
    for (const cb of this._listeners) cb(report);
  }
}

export const launchReadinessEngine = LaunchReadinessEngine.getInstance();

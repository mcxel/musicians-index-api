import { existsSync } from "fs";
import { resolve } from "path";

type SmokeStatus = "PASS" | "FAIL";
type FailureKind = "Missing Route" | "Broken Import" | "Broken Data Dependency";

type RouteCheck = {
  name: string;
  route: string;
  candidates: string[];
};

const ROOT = process.cwd();

const checks: RouteCheck[] = [
  { name: "home/1", route: "/home/1", candidates: ["src/app/home/1/page.tsx", "app/home/1/page.tsx"] },
  { name: "home/1-2", route: "/home/1-2", candidates: ["src/app/home/1-2/page.tsx", "app/home/1-2/page.tsx"] },
  { name: "home/2", route: "/home/2", candidates: ["src/app/home/2/page.tsx", "app/home/2/page.tsx"] },
  { name: "home/3", route: "/home/3", candidates: ["src/app/home/3/page.tsx", "app/home/3/page.tsx"] },
  { name: "home/4", route: "/home/4", candidates: ["src/app/home/4/page.tsx", "app/home/4/page.tsx"] },
  { name: "home/5", route: "/home/5", candidates: ["src/app/home/5/page.tsx", "app/home/5/page.tsx"] },

  { name: "profile artist", route: "/profile/artist/*", candidates: ["src/app/profile/artist/[slug]/page.tsx", "app/profile/artist/[slug]/page.tsx"] },
  { name: "profile performer", route: "/profile/performer/*", candidates: ["src/app/profile/performer/[slug]/page.tsx", "app/profile/performer/[slug]/page.tsx"] },

  { name: "magazine articles", route: "/magazine/articles/*", candidates: ["src/app/magazine/articles/[slug]/page.tsx", "app/magazine/articles/[slug]/page.tsx"] },
  { name: "billboards", route: "/billboards/*", candidates: ["src/app/billboards/[id]/page.tsx", "app/billboards/[id]/page.tsx"] },
  { name: "live", route: "/live/*", candidates: ["src/app/live/page.tsx", "app/live/page.tsx", "src/app/live/stages/page.tsx", "app/live/stages/page.tsx"] },
  { name: "admin", route: "/admin/*", candidates: ["src/app/admin/page.tsx", "app/admin/page.tsx", "src/app/admin/observatory/chat/page.tsx", "app/admin/observatory/chat/page.tsx"] },
  { name: "tickets", route: "/tickets/*", candidates: ["src/app/tickets/page.tsx", "app/tickets/page.tsx"] },
  { name: "store", route: "/store/*", candidates: ["src/app/store/page.tsx", "app/store/page.tsx"] },
  { name: "bookings (canonical)", route: "/bookings", candidates: ["src/app/bookings/page.tsx", "app/bookings/page.tsx"] },
  { name: "booking hub", route: "/booking/*", candidates: ["src/app/booking/page.tsx", "app/booking/page.tsx"] },
];

function firstExisting(candidates: string[]): string | null {
  for (const rel of candidates) {
    if (existsSync(resolve(ROOT, rel))) return rel;
  }
  return null;
}

function printResult(status: SmokeStatus, route: string, detail: string, kind?: FailureKind) {
  if (status === "PASS") {
    console.log(`PASS | ${route} | ${detail}`);
  } else {
    console.log(`FAIL | ${route} | ${kind ?? "Missing Route"} | ${detail}`);
  }
}

function run(): number {
  let hasFail = false;

  console.log("=== Route Matrix Smoke ===");
  console.log(`Root: ${ROOT}`);

  for (const check of checks) {
    const found = firstExisting(check.candidates);

    if (!found) {
      hasFail = true;
      printResult("FAIL", check.route, `${check.name}: none of [${check.candidates.join(", ")}] found`, "Missing Route");
      continue;
    }

    // Static smoke level: route file exists.
    printResult("PASS", check.route, `${check.name}: ${found}`);
  }

  if (hasFail) {
    console.log("=== Route Matrix Smoke: FAIL ===");
    return 1;
  }

  console.log("=== Route Matrix Smoke: PASS ===");
  return 0;
}

process.exitCode = run();

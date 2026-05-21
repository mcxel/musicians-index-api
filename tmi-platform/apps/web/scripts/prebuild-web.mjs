import { execSync } from "node:child_process";

function run(command) {
  execSync(command, { stdio: "inherit", shell: true });
}

run("pnpm -C ../.. -r --filter @tmi/contracts --filter @tmi/hud-core --filter @tmi/hud-runtime --filter @tmi/hud-theme --filter @tmi/hud-tmi build");

try {
  run("pnpm -C ../../packages/db prisma:generate");
} catch {
  console.warn("[web prebuild] Prisma generate failed; continuing web-only build path.");
}

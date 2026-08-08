import fs from "fs";
import path from "path";

const SRC = path.resolve("apps/web/src");
const importRe = /from\s+["'](@\/[^"']+|\.\.?\/[^"']+)["']/g;

function resolveImport(fromFile, spec) {
  let base;
  if (spec.startsWith("@/")) base = path.join(SRC, spec.slice(2));
  else base = path.resolve(path.dirname(fromFile), spec);
  const tries = [
    base,
    base + ".ts",
    base + ".tsx",
    base + ".js",
    base + ".jsx",
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ];
  for (const t of tries) {
    if (fs.existsSync(t) && fs.statSync(t).isFile()) return t;
  }
  return null;
}

const visiting = new Set();
const done = new Set();
const cycles = [];

function dfs(file, stack) {
  if (visiting.has(file)) {
    const i = stack.indexOf(file);
    if (i >= 0) {
      cycles.push(
        [...stack.slice(i), file].map((f) =>
          path.relative(SRC, f).replace(/\\/g, "/")
        )
      );
    }
    return;
  }
  if (done.has(file)) return;
  visiting.add(file);
  stack.push(file);
  let src;
  try {
    src = fs.readFileSync(file, "utf8");
  } catch {
    visiting.delete(file);
    stack.pop();
    return;
  }
  for (const m of src.matchAll(importRe)) {
    const next = resolveImport(file, m[1]);
    if (!next) continue;
    dfs(next, stack);
  }
  stack.pop();
  visiting.delete(file);
  done.add(file);
}

const seeds = [
  "components/eos/StageLoader.tsx",
  "registries/experiences/ExperienceComponentRegistry.ts",
  "app/rooms/fan-lobby/page.tsx",
  "components/commandCenter/CommandCenterShell.tsx",
  "components/admin/OverseerFlightDeck.tsx",
  "components/room/SharedRoomVideoPanel.tsx",
  "app/layout.tsx",
].map((f) => path.join(SRC, f));

for (const s of seeds) dfs(s, []);

const uniq = [...new Map(cycles.map((c) => [c.join(" -> "), c])).values()];
console.log("cycles found:", uniq.length);
for (const c of uniq.slice(0, 40)) console.log(c.join(" -> "));

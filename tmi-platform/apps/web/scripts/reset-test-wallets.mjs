#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = process.cwd();
const target = join(root, "src", "lib", "seeds", "fullTestPopulation.generated.json");

const raw = readFileSync(target, "utf8");
const data = JSON.parse(raw);

if (!Array.isArray(data.accounts)) {
  throw new Error("Invalid seed payload: accounts array missing");
}

let updated = 0;
for (const account of data.accounts) {
  if (account?.mode !== "TEST") continue;
  account.wallet = account.wallet || {};
  account.wallet.testCash = 0;
  account.wallet.testPoints = 0;
  updated += 1;
}

data.lastWalletResetAt = new Date().toISOString();
data.lastWalletResetMode = "TEST_ONLY";

writeFileSync(target, JSON.stringify(data, null, 2), "utf8");

console.log("TEST wallet reset complete");
console.log(`Accounts reset: ${updated}`);
console.log(`File: ${target}`);

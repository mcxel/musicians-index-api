import { spawn } from "node:child_process";
import { ManufacturingAssetType, ManufacturingJob } from "./ManufacturingJob";
import { ManufacturingState } from "./ManufacturingState";

function run(command: string, args: string[], cwd = process.cwd()): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited ${code}`));
    });
    child.on("error", reject);
  });
}

export class CertificationDirector {
  async validateAndIngest(job: ManufacturingJob): Promise<void> {
    await run("pnpm", ["assets:validate"]);
    job.transition(ManufacturingState.VALIDATION_PASS);

    await run("pnpm", ["assets:ingest"]);
    job.transition(ManufacturingState.EXPORT_COMPLETE);
    job.transition(ManufacturingState.INGESTION_COMPLETE);

    if (job.data.assetType === ("VENUE" satisfies ManufacturingAssetType)) {
      await run("pnpm", ["venue:preflight"]);
    }

    job.transition(ManufacturingState.CERTIFICATION_READY);
  }
}

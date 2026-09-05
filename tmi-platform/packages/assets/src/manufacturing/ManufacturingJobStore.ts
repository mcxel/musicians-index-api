import { promises as fs } from "node:fs";
import path from "node:path";
import { JOBS_DIR } from "./FoundryPaths";
import { ManufacturingJob, ManufacturingJobData } from "./ManufacturingJob";

export class ManufacturingJobStore {
  constructor(private readonly jobsDir: string = JOBS_DIR) {}

  async ensure(): Promise<void> {
    await fs.mkdir(this.jobsDir, { recursive: true });
  }

  private jobPath(jobId: string): string {
    if (!/^[A-Za-z0-9._-]+$/.test(jobId)) {
      throw new Error(`[TMI-MF-1001] Unsafe job id: ${jobId}`);
    }
    return path.join(this.jobsDir, `${jobId}.json`);
  }

  async save(job: ManufacturingJob): Promise<void> {
    await this.ensure();
    const target = this.jobPath(job.data.jobId);
    const temp = `${target}.tmp`;
    await fs.writeFile(temp, JSON.stringify(job.toJSON(), null, 2) + "\n", "utf8");
    await fs.rename(temp, target);
  }

  async load(jobId: string): Promise<ManufacturingJob> {
    const raw = await fs.readFile(this.jobPath(jobId), "utf8");
    return new ManufacturingJob(JSON.parse(raw) as ManufacturingJobData);
  }

  async list(): Promise<ManufacturingJob[]> {
    await this.ensure();
    const names = (await fs.readdir(this.jobsDir))
      .filter((name) => name.endsWith(".json"))
      .sort();
    return Promise.all(
      names.map(async (name) => {
        const raw = await fs.readFile(path.join(this.jobsDir, name), "utf8");
        return new ManufacturingJob(JSON.parse(raw) as ManufacturingJobData);
      }),
    );
  }
}

import { promises as fs } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { FOUNDRY_CONFIG } from "./foundry.config";
import { ARTIFACTS_DIR, INTENTS_DIR } from "./FoundryPaths";
import { ManufacturingArtifact } from "./ManufacturingArtifact";
import { ManufacturingJob, ManufacturingAssetType } from "./ManufacturingJob";
import { ManufacturingJobStore } from "./ManufacturingJobStore";
import { ManufacturingRecipe } from "./ManufacturingRecipe";
import { ManufacturingState } from "./ManufacturingState";

function safeId(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]/g, "-");
}

async function runBlender(script: string, intentPath: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      FOUNDRY_CONFIG.blenderExecutable,
      ["--background", "--python", script, "--", "--intent", intentPath],
      { cwd: process.cwd(), stdio: "inherit" },
    );
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`Blender exited ${code}`)));
    child.on("error", reject);
  });
}

export class AssetManufacturingDirector {
  constructor(private readonly store = new ManufacturingJobStore()) {}

  async createJob(
    recipe: ManufacturingRecipe,
    intentOverrides: Record<string, unknown> = {},
  ): Promise<ManufacturingJob> {
    await fs.mkdir(INTENTS_DIR, { recursive: true });
    await fs.mkdir(ARTIFACTS_DIR, { recursive: true });

    const intent = { ...recipe.intentTemplate, ...intentOverrides };
    const assetId = String(intent.assetId ?? recipe.id);
    const entropy = `${assetId}:${Date.now()}:${Math.random()}`;
    const suffix = createHash("sha256").update(entropy).digest("hex").slice(0, 8);
    const jobId = `${FOUNDRY_CONFIG.jobIdPrefix}-${recipe.assetType}-${safeId(assetId)}-${suffix}`;
    const intentPath = path.join(INTENTS_DIR, `${jobId}.json`);
    await fs.writeFile(intentPath, JSON.stringify({
      ...intent,
      jobId,
      artifactRoot: path.join(ARTIFACTS_DIR, jobId),
      coordinateSystem: FOUNDRY_CONFIG.authoring,
    }, null, 2) + "\n", "utf8");

    const job = ManufacturingJob.create({
      jobId,
      assetId,
      assetType: recipe.assetType as ManufacturingAssetType,
      recipeId: recipe.id,
      recipeVersion: recipe.version,
      intentPath,
      provenance: {
        rigVersion: recipe.assetType === "AVATAR" ? FOUNDRY_CONFIG.avatarRigVersion : undefined,
        motionPackageVersion: recipe.assetType === "AVATAR" ? FOUNDRY_CONFIG.motionPackageVersion : undefined,
        generator: "TMI Autonomous Asset Foundry",
        generatorVersion: "Phase1/1.0",
        sourceIntent: intentPath,
      },
    });

    job.addArtifact({
      id: `${jobId}:intent`,
      kind: "INTENT",
      path: intentPath,
      createdAt: new Date().toISOString(),
    });
    await this.store.save(job);
    return job;
  }

  async runGeneration(job: ManufacturingJob, recipe: ManufacturingRecipe): Promise<void> {
    job.transition(ManufacturingState.PLANNING);
    await this.store.save(job);

    job.transition(ManufacturingState.CONCEPT_CREATED);
    await this.store.save(job);

    const generationStep = recipe.steps.find((step) => step.script);
    if (!generationStep?.script) {
      throw new Error(`Recipe ${recipe.id} has no generation script`);
    }

    await runBlender(generationStep.script, job.data.intentPath);

    // Blender writes a report containing the detailed manufacturing stages.
    // The orchestrator records the generation checkpoint and leaves deeper stage
    // verification to the report/validators rather than inventing success.
    job.transition(ManufacturingState.MESH_CREATED);
    await this.store.save(job);
  }

  async markArtifact(job: ManufacturingJob, artifact: ManufacturingArtifact): Promise<void> {
    job.addArtifact(artifact);
    await this.store.save(job);
  }
}

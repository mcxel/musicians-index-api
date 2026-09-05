// src/foundry/FoundryPipeline.ts

import { AssetManufacturingDirector } from "../manufacturing/AssetManufacturingDirector";
import { ManufacturingRecipe } from "../manufacturing/ManufacturingRecipe";
import { readFile } from "node:fs/promises";
import { normalize } from "./Normalization";
import { runQA } from "./QA";
export class FoundryPipeline {
  private director = new AssetManufacturingDirector();

  async execute(recipe: ManufacturingRecipe, intentOverrides: Record<string, unknown> = {}): Promise<void> {
    const job = await this.director.createJob(recipe, intentOverrides);
    await this.director.runGeneration(job, recipe);
    // Load intent to get artifactRoot
    const intent = JSON.parse(await readFile(job.data.intentPath, "utf-8"));
    await normalize(job.data.jobId, intent.artifactRoot);
    await runQA(job.data.jobId, intent.artifactRoot);
  }
}

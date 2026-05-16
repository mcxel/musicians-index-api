/**
 * InstrumentalProductionEngine
 * Instrumental project management and rendering pipeline state.
 */

export type InstrumentFamily = "hiphop" | "rnb" | "electronic" | "trap" | "afro" | "experimental";
export type InstrumentalStatus = "draft" | "arranging" | "mixing" | "mastered" | "published" | "archived";

export type InstrumentalStem = {
  stemId: string;
  name: string;
  category: "drums" | "bass" | "keys" | "synth" | "fx" | "vocal_chop";
  fileUrl: string;
  gainDb: number;
  muted: boolean;
};

export type InstrumentalProject = {
  projectId: string;
  producerId: string;
  producerName: string;
  title: string;
  family: InstrumentFamily;
  bpm: number;
  musicalKey: string;
  status: InstrumentalStatus;
  stems: InstrumentalStem[];
  notes: string[];
  renderUrl: string | null;
  createdAtMs: number;
  updatedAtMs: number;
};

let _projectSeq = 0;
let _stemSeq = 0;

export class InstrumentalProductionEngine {
  private readonly projects: Map<string, InstrumentalProject> = new Map();

  createProject(params: {
    producerId: string;
    producerName: string;
    title: string;
    family: InstrumentFamily;
    bpm: number;
    musicalKey: string;
  }): InstrumentalProject {
    const now = Date.now();
    const project: InstrumentalProject = {
      projectId: `inst-${Date.now()}-${++_projectSeq}`,
      producerId: params.producerId,
      producerName: params.producerName,
      title: params.title,
      family: params.family,
      bpm: params.bpm,
      musicalKey: params.musicalKey,
      status: "draft",
      stems: [],
      notes: [],
      renderUrl: null,
      createdAtMs: now,
      updatedAtMs: now,
    };

    this.projects.set(project.projectId, project);
    return project;
  }

  addStem(
    projectId: string,
    params: { name: string; category: InstrumentalStem["category"]; fileUrl: string; gainDb?: number },
  ): InstrumentalStem | null {
    const project = this.projects.get(projectId);
    if (!project || project.status === "published" || project.status === "archived") return null;

    const stem: InstrumentalStem = {
      stemId: `stem-${Date.now()}-${++_stemSeq}`,
      name: params.name,
      category: params.category,
      fileUrl: params.fileUrl,
      gainDb: params.gainDb ?? 0,
      muted: false,
    };

    project.stems.push(stem);
    project.updatedAtMs = Date.now();
    return stem;
  }

  updateStatus(projectId: string, status: InstrumentalStatus): void {
    const project = this.projects.get(projectId);
    if (!project) return;
    project.status = status;
    project.updatedAtMs = Date.now();
  }

  attachRender(projectId: string, renderUrl: string): void {
    const project = this.projects.get(projectId);
    if (!project) return;
    project.renderUrl = renderUrl;
    project.status = "mastered";
    project.updatedAtMs = Date.now();
  }

  publish(projectId: string): void {
    const project = this.projects.get(projectId);
    if (!project || !project.renderUrl) return;
    project.status = "published";
    project.updatedAtMs = Date.now();
  }

  addNote(projectId: string, note: string): void {
    const project = this.projects.get(projectId);
    if (!project) return;
    project.notes.push(note);
    project.updatedAtMs = Date.now();
  }

  getProject(projectId: string): InstrumentalProject | null {
    return this.projects.get(projectId) ?? null;
  }

  listByProducer(producerId: string): InstrumentalProject[] {
    return [...this.projects.values()].filter((project) => project.producerId === producerId);
  }

  listPublished(): InstrumentalProject[] {
    return [...this.projects.values()].filter((project) => project.status === "published");
  }
}

export const instrumentalProductionEngine = new InstrumentalProductionEngine();

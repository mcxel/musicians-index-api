export const STAGE_PAD_PAGE_COUNT = 4;
const DOCUMENT_MARKER = "tmi-stage-pad-v1";

export interface StagePadPoint {
  x: number;
  y: number;
  pressure?: number;
}

export interface StagePadStroke {
  color: string;
  width: number;
  tool: "pen" | "marker" | "eraser";
  points: StagePadPoint[];
}

export interface StagePadPage {
  text: string;
  strokes: StagePadStroke[];
  paper: "ruled" | "blank" | "grid";
}

export interface StagePadDocument {
  version: 1;
  pages: StagePadPage[];
}

export function createStagePadDocument(): StagePadDocument {
  return {
    version: 1,
    pages: Array.from({ length: STAGE_PAD_PAGE_COUNT }, (): StagePadPage => ({ text: "", strokes: [] as StagePadStroke[], paper: "ruled" })),
  };
}

function isPoint(value: unknown): value is StagePadPoint {
  if (!value || typeof value !== "object") return false;
  const point = value as Record<string, unknown>;
  return typeof point.x === "number" && Number.isFinite(point.x)
    && typeof point.y === "number" && Number.isFinite(point.y)
    && (point.pressure === undefined || (typeof point.pressure === "number" && Number.isFinite(point.pressure)));
}

function isStroke(value: unknown): value is StagePadStroke {
  if (!value || typeof value !== "object") return false;
  const stroke = value as Record<string, unknown>;
  return typeof stroke.color === "string"
    && typeof stroke.width === "number"
    && Number.isFinite(stroke.width)
    && (stroke.tool === "pen" || stroke.tool === "marker" || stroke.tool === "eraser")
    && Array.isArray(stroke.points)
    && stroke.points.every(isPoint);
}

function isPage(value: unknown): value is StagePadPage {
  if (!value || typeof value !== "object") return false;
  const page = value as Record<string, unknown>;
  return typeof page.text === "string"
    && Array.isArray(page.strokes)
    && page.strokes.every(isStroke)
    && (page.paper === "ruled" || page.paper === "blank" || page.paper === "grid");
}

export function parseStagePadDocument(content: string): StagePadDocument {
  try {
    const value: unknown = JSON.parse(content);
    if (!value || typeof value !== "object") return legacyDocument(content);
    const record = value as Record<string, unknown>;
    if (record.marker !== DOCUMENT_MARKER || record.version !== 1 || !Array.isArray(record.pages)) {
      return legacyDocument(content);
    }
    if (!record.pages.every(isPage)) return legacyDocument(content);

    const document = createStagePadDocument();
    for (let index = 0; index < Math.min(record.pages.length, STAGE_PAD_PAGE_COUNT); index += 1) {
      const page = record.pages[index] as StagePadPage;
      document.pages[index] = { text: page.text, strokes: page.strokes, paper: page.paper };
    }
    return document;
  } catch {
    return legacyDocument(content);
  }
}

function legacyDocument(content: string): StagePadDocument {
  const document = createStagePadDocument();
  document.pages[0].text = content;
  return document;
}

export function serializeStagePadDocument(document: StagePadDocument): string {
  const pages = Array.from({ length: STAGE_PAD_PAGE_COUNT }, (_, index) => {
    const page = document.pages[index] ?? { text: "", strokes: [], paper: "ruled" as const };
    return {
      text: page.text,
      strokes: page.strokes.filter(isStroke),
      paper: page.paper,
    };
  });
  return JSON.stringify({ marker: DOCUMENT_MARKER, version: 1, pages });
}


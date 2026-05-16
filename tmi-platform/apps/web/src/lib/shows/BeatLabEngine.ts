/**
 * BeatLabEngine
 * Beat creation workflow — draft, layers, licensing, publish pipeline.
 */

export type BeatStatus = "draft" | "processing" | "published" | "archived" | "licensed";

export type BeatLayer = {
  layerId: string;
  type: "drums" | "bass" | "melody" | "harmony" | "fx" | "vocals" | "sample";
  url: string;
  volumeDb: number;
  muteByDefault: boolean;
};

export type BeatLicense = {
  licenseId: string;
  type: "basic" | "premium" | "exclusive" | "free";
  price: number;
  allowsCommercial: boolean;
  allowsResale: boolean;
  creditsRequired: boolean;
};

export type Beat = {
  beatId: string;
  producerId: string;
  producerName: string;
  title: string;
  genre: string;
  bpm: number;
  key: string;
  durationSec: number;
  previewUrl: string | null;
  fullTrackUrl: string | null;
  layers: BeatLayer[];
  licenses: BeatLicense[];
  status: BeatStatus;
  plays: number;
  purchases: number;
  createdAtMs: number;
  publishedAtMs: number | null;
  tags: string[];
};

const DEFAULT_LICENSES: BeatLicense[] = [
  { licenseId: "lic-basic", type: "basic", price: 29.99, allowsCommercial: false, allowsResale: false, creditsRequired: true },
  { licenseId: "lic-premium", type: "premium", price: 99.99, allowsCommercial: true, allowsResale: false, creditsRequired: false },
  { licenseId: "lic-exclusive", type: "exclusive", price: 499.99, allowsCommercial: true, allowsResale: true, creditsRequired: false },
];

let _beatSeq = 0;
let _layerSeq = 0;

export class BeatLabEngine {
  private readonly beats: Map<string, Beat> = new Map();

  createBeat(params: {
    producerId: string;
    producerName: string;
    title: string;
    genre: string;
    bpm: number;
    key: string;
    durationSec?: number;
    tags?: string[];
  }): Beat {
    const beatId = `beat-${Date.now()}-${++_beatSeq}`;
    const beat: Beat = {
      beatId,
      producerId: params.producerId,
      producerName: params.producerName,
      title: params.title,
      genre: params.genre,
      bpm: params.bpm,
      key: params.key,
      durationSec: params.durationSec ?? 0,
      previewUrl: null,
      fullTrackUrl: null,
      layers: [],
      licenses: DEFAULT_LICENSES.map((l) => ({ ...l, licenseId: `${l.licenseId}-${beatId}` })),
      status: "draft",
      plays: 0,
      purchases: 0,
      createdAtMs: Date.now(),
      publishedAtMs: null,
      tags: params.tags ?? [],
    };
    this.beats.set(beatId, beat);
    return beat;
  }

  addLayer(beatId: string, type: BeatLayer["type"], url: string, volumeDb: number = 0): BeatLayer | null {
    const beat = this.beats.get(beatId);
    if (!beat || beat.status !== "draft") return null;

    const layer: BeatLayer = {
      layerId: `layer-${Date.now()}-${++_layerSeq}`,
      type,
      url,
      volumeDb,
      muteByDefault: false,
    };

    beat.layers.push(layer);
    return layer;
  }

  setPreview(beatId: string, previewUrl: string): void {
    const beat = this.beats.get(beatId);
    if (beat) beat.previewUrl = previewUrl;
  }

  setFullTrack(beatId: string, url: string, durationSec: number): void {
    const beat = this.beats.get(beatId);
    if (!beat) return;
    beat.fullTrackUrl = url;
    beat.durationSec = durationSec;
  }

  publish(beatId: string): void {
    const beat = this.beats.get(beatId);
    if (!beat || beat.status !== "draft") return;
    beat.status = "published";
    beat.publishedAtMs = Date.now();
  }

  incrementPlay(beatId: string): void {
    const beat = this.beats.get(beatId);
    if (beat) beat.plays += 1;
  }

  recordPurchase(beatId: string): void {
    const beat = this.beats.get(beatId);
    if (beat) beat.purchases += 1;
  }

  archive(beatId: string): void {
    const beat = this.beats.get(beatId);
    if (beat) beat.status = "archived";
  }

  getBeat(beatId: string): Beat | null {
    return this.beats.get(beatId) ?? null;
  }

  getPublished(genre?: string): Beat[] {
    return [...this.beats.values()]
      .filter((b) => b.status === "published" && (!genre || b.genre === genre))
      .sort((a, b) => b.publishedAtMs! - a.publishedAtMs!);
  }

  getProducerBeats(producerId: string): Beat[] {
    return [...this.beats.values()].filter((b) => b.producerId === producerId);
  }
}

export const beatLabEngine = new BeatLabEngine();

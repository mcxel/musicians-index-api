export interface AssetRequirement {
  id: string;
  collectionId: string;
  category: 'ARCHITECTURE' | 'FURNITURE' | 'LIGHTING' | 'MEDIA' | 'DECOR' | 'SEATING' | 'INTERACTIVE';
  name: string;
  approxDims: { w: number; d: number; h: number };
  styleTags: string[];
  materialTags: string[];
  requiredAnchors: string[]; // e.g., FLOOR, WALL, CEILING, SEAT, MEDIA
  sourceImages: string[];
}

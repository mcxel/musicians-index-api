export type TMILayerType = 'underlay' | 'overlay' | 'sticker' | 'cta';

export type TMIBlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light';

export interface TMILayer {
  id: string;
  type: TMILayerType;
  label: string;
  assetUrl?: string;
  text?: string;
  href?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotation: number;
  opacity: number;
  blendMode: TMIBlendMode;
  zIndex: number;
  isLocked: boolean;
  animation?: {
    type: 'float' | 'pulse' | 'drift';
    speed: number;
  };
}

export interface TMILayerSessionState {
  issueId: string;
  layers: TMILayer[];
  updatedAt: string;
}

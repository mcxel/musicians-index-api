export const TMI_MAGAZINE_Z_INDEX = {
  baseStage: 0,
  underlay: 8,
  bookShell: 16,
  pageSkeleton: 24,
  content: 32,
  overlay: 40,
  interaction: 50,
} as const;

export type TmiMagazineZIndexKey = keyof typeof TMI_MAGAZINE_Z_INDEX;

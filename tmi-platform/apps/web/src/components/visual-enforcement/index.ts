/**
 * src/components/visual-enforcement/index.ts
 * 
 * Central export for all visual authority enforcement components.
 * 
 * Every public visual rendering must use one of these wrappers:
 * - MagazineSlotWrapper - Magazine covers, articles, sponsor inserts
 * - PerformerPortraitWrapper - Motion portraits, avatars
 * - VenueReconstructionWrapper - Venue 3D, environments
 * - ImageSlotWrapper - Generic images (articles, homepage, etc)
 */

export { MagazineSlotWrapper, useIsMagazineSlotBlocked } from './MagazineSlotWrapper';
export type { MagazineSlotWrapperProps } from './MagazineSlotWrapper';

export { PerformerPortraitWrapper } from './PerformerPortraitWrapper';
export type { PerformerPortraitWrapperProps } from './PerformerPortraitWrapper';

export { VenueReconstructionWrapper } from './VenueReconstructionWrapper';
export type { VenueReconstructionWrapperProps } from './VenueReconstructionWrapper';

export { ImageSlotWrapper, ImageBatchWrapper } from './ImageSlotWrapper';
export type { ImageSlotWrapperProps } from './ImageSlotWrapper';

/**
 * ENFORCEMENT RULE
 * 
 * No component may render an image, video, or visual asset directly
 * without wrapping it in one of these authority-enforced components.
 * 
 * BANNED PATTERNS:
 * ❌ <img src={staticUrl} />
 * ❌ {imageUrl && <img src={imageUrl} />}
 * ❌ style={{ backgroundImage: `url(${imageUrl})` }}
 * 
 * REQUIRED PATTERNS:
 * ✅ <MagazineSlotWrapper slotId="cover_001" roomId={roomId} imageUrl={imageUrl} />
 * ✅ <PerformerPortraitWrapper performerId={id} roomId={roomId} displayName={name} />
 * ✅ <VenueReconstructionWrapper venueId={id} roomId={roomId} venueName={name} />
 * ✅ <ImageSlotWrapper imageId={id} roomId={roomId} altText={alt} />
 */

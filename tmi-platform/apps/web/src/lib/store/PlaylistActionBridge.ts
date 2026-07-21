// ─── Playlist Action Bridge ──────────────────────────────────────────────────
// Connects playlist UI components, audio player rails, and song cards
// directly into the Beats & NFTs wing of the Flex Store and Submission Engine.

export interface PlaylistTrackBridgeContext {
  trackId: string;
  title: string;
  artistName: string;
  artistSlug: string;
  beatId?: string;
  priceCents?: number;
  isBeatOwner?: boolean;
}

export interface PlaylistActionOption {
  id: string;
  label: string;
  icon: string;
  targetUrl: string;
  actionType: 'store_beat' | 'store_nft' | 'submit_battle' | 'submit_dance' | 'submit_monday_stage' | 'use_yopho';
  description: string;
}

/**
 * Generates direct structured context link to Flex Store Beats Wing
 */
export function getFlexStoreBeatUrl(trackId: string, beatId?: string): string {
  const params = new URLSearchParams({
    wing: 'beats',
    source: 'playlist',
    trackId,
    ...(beatId ? { beatId } : {}),
  });
  return `/store/flex?${params.toString()}`;
}

/**
 * Returns canonical action menu options for any playlist track
 */
export function getPlaylistActionOptions(context: PlaylistTrackBridgeContext): PlaylistActionOption[] {
  const encodedTitle = encodeURIComponent(context.title);
  return [
    {
      id: 'buy_beat_license',
      label: 'Buy Beat License ($4.99)',
      icon: '🎹',
      targetUrl: getFlexStoreBeatUrl(context.trackId, context.beatId),
      actionType: 'store_beat',
      description: 'Acquire full commercial recording & performance rights in Flex Store',
    },
    {
      id: 'mint_nft_collectible',
      label: 'Mint / Buy Track NFT ($4.99)',
      icon: '💎',
      targetUrl: `/store/flex?wing=nfts&source=playlist&trackId=${context.trackId}`,
      actionType: 'store_nft',
      description: 'Own verified 1-of-1 platform collectible token with XP boost',
    },
    {
      id: 'submit_to_battle',
      label: 'Submit to Producer Battle Queue',
      icon: '⚔️',
      targetUrl: `/submit/producer?type=battle&trackId=${context.trackId}&title=${encodedTitle}`,
      actionType: 'submit_battle',
      description: 'Enter track into active Beat Battle Arena competition rotation',
    },
    {
      id: 'submit_to_dance_party',
      label: 'Submit to World Dance Party',
      icon: '💃',
      targetUrl: `/submit/producer?type=dance&trackId=${context.trackId}&title=${encodedTitle}`,
      actionType: 'submit_dance',
      description: 'Submit song & choreography video into World Dance Party rotation',
    },
    {
      id: 'submit_monday_stage',
      label: "Submit to Marcel's Monday Night Stage",
      icon: '🎙️',
      targetUrl: `/competitions/monday-night-stage?action=submit&trackId=${context.trackId}`,
      actionType: 'submit_monday_stage',
      description: 'Compete live in the Apollo + Star Search + AGT weekly showcase',
    },
    {
      id: 'use_in_yopho',
      label: 'Use Track in YoPho Living Stage',
      icon: '🎭',
      targetUrl: `/profile/performer/${context.artistSlug}?mode=yopho&trackId=${context.trackId}`,
      actionType: 'use_yopho',
      description: 'Set as primary interactive audio background for your YoPho Canvas',
    },
  ];
}

/**
 * Bebo Sound Cues
 *
 * Maps Bebo's 5-stage crowd-enforcer state transitions to arrays of
 * SoundManifest IDs. Every ID here must exist in SoundManifest.ts.
 * The caller (MondayNightStageEngine) resolves each ID via getSoundById()
 * and plays them in order through playSound().
 *
 * Rule 8 applied to audio: this is application logic (Bebo's character
 * behaviour), kept separate from SoundManifest.ts (which is raw asset
 * metadata). The manifest owns what files exist; this file owns what
 * Bebo does with them.
 */

/** Sound cue IDs for each Bebo stage transition */
export const BEBO_SOUND_CUES = {
  /**
   * OFFSTAGE → PEEK
   * Bebo leans around the backstage curtain — crowd hears something rustling
   * and a murmur ripples through the audience.
   */
  BEBO_PEEK: ['venue_curtains', 'crowd_small_reactions'],

  /**
   * PEEK → ON_STAGE_WARNING
   * Bebo steps onto the stage. Funny buzzer announces his arrival.
   * Crowd murmur grows as they realize what's happening.
   */
  BEBO_WARNING: ['gameshow_buzzer', 'crowd_small_reactions'],

  /**
   * ON_STAGE_WARNING → RECOVERY_EXIT
   * The performer rallied — crowd swung back to cheers.
   * Bebo raises his hook in a "well played" gesture and backs offstage.
   * Positive sting + applause swell.
   */
  BEBO_RECOVERY: ['crowd_cheer_auditorium', 'concert_uplift_theme'],

  /**
   * PEEK → OFFSTAGE (crowd recovered before Bebo hit the stage)
   * Quiet retreat — just the curtain swishing closed again.
   */
  BEBO_SILENT_RETREAT: ['venue_curtains'],

  /**
   * ON_STAGE_WARNING → REMOVAL
   * Performer couldn't turn the crowd. Bebo theatrically closes the
   * performance: comedic sting → crowd disappointment → panel slide whoosh.
   */
  BEBO_REMOVAL: ['gameshow_buzzer', 'crowd_disappointment', 'ui_whoosh_bubbles'],

  /**
   * Show open: Bebo makes his first entrance for the night.
   * Curtain + crowd laughing in delight.
   */
  BEBO_ENTRANCE: ['venue_curtains', 'crowd_laughing'],

  /**
   * Encore earned: Bebo hypes the encore reaction.
   * Stadium cheer + air horn.
   */
  BEBO_ENCORE: ['crowd_cheering_stadium', 'battle_air_horn'],
} as const;

export type BeboSoundCueKey = keyof typeof BEBO_SOUND_CUES;

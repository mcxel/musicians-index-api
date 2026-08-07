"use client";

/**
 * Song Challenge subtype — Content Picker filtered to songs.
 * Generic challenges use ChallengeContentPicker without typeFilter.
 */

import ChallengeContentPicker, {
  type ContentPickerItem,
} from "@/components/challenge/ChallengeContentPicker";

/** @deprecated Prefer ContentPickerItem — kept for Song Challenge call sites. */
export type PickerSong = ContentPickerItem;

interface Props {
  maxSelect?: number;
  side?: "A" | "B";
  onLocked?: (songs: PickerSong[]) => void;
  disabled?: boolean;
  roomId?: string;
  castBy?: string | null;
  popup?: boolean;
  open?: boolean;
  onClose?: () => void;
}

export default function SongChallengeSongPicker({
  maxSelect = 3,
  side = "A",
  onLocked,
  disabled = false,
  roomId,
  castBy,
  popup = true,
  open = true,
  onClose,
}: Props) {
  return (
    <ChallengeContentPicker
      side={side}
      maxSelect={maxSelect}
      typeFilter={["songs"]}
      disabled={disabled}
      roomId={roomId}
      castBy={castBy}
      popup={popup}
      open={open}
      onClose={onClose}
      onLocked={onLocked}
    />
  );
}

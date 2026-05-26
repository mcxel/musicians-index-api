import type { StreamWinSong, FeedbackReaction } from "@/lib/economy/StreamAndWinEngine";
import { BPMMatchEngine } from "./BPMMatchEngine";
import type { TransitionResult } from "./BPMMatchEngine";
import { PlaylistFairnessEngine } from "./PlaylistFairnessEngine";
import { TrendLearningEngine } from "./TrendLearningEngine";

export interface DJDecision {
  song: StreamWinSong;
  transition: TransitionResult;
  djComment: string;
}

function buildComment(song: StreamWinSong, transition: TransitionResult, isFirstPlay: boolean): string {
  if (isFirstPlay) {
    return `First time dropping this one — let's see how the room takes it 👀`;
  }
  switch (transition.type) {
    case "hype-drop":
      return `Hard flip incoming 🔥 energy's about to shift`;
    case "quick-cut":
      return `Cutting right to it — no time to breathe 🎧`;
    case "slow-blend":
      return `Easing into ${song.title}… let this one breathe 🎵`;
    case "genre-bridge":
      return `Switching the vibe — ${song.genre} incoming 🎶`;
    case "fade":
    default:
      return `Ayo this next one's smooth 👀 chat y'all rocking with ${song.title} or nah?`;
  }
}

export const RadioDJEngine = {
  getNextSong(current: StreamWinSong | null, available: StreamWinSong[]): DJDecision | null {
    if (available.length === 0) return null;

    // Ensure all songs are registered in fairness engine
    for (const s of available) {
      PlaylistFairnessEngine.register(s.id, s.artistId);
    }

    const currentId = current?.id ?? "";
    const nextSong = PlaylistFairnessEngine.getNext(currentId, available);
    if (!nextSong) return null;

    // Among BPM-compatible alternatives, prefer the fairness pick but refine ordering
    // Re-run with BPM sort for the top candidates
    const eligible = available
      .filter(s => s.id !== currentId && s.state !== "expired" && PlaylistFairnessEngine.isEligible(s.id));

    const bpmSorted = current
      ? BPMMatchEngine.sortByBPMCompatibility(current.genre, eligible.length > 0 ? eligible : available)
      : available;

    // Use fairness pick as authoritative if eligible, otherwise take BPM top pick
    const fairnessIsEligible = PlaylistFairnessEngine.isEligible(nextSong.id);
    const chosen = fairnessIsEligible ? nextSong : (bpmSorted[0] ?? nextSong);

    const transition = current
      ? BPMMatchEngine.getTransition(current.genre, chosen.genre)
      : { type: "fade" as const, label: "starting the session…", score: 1.0 };

    const entry = available.find(s => s.id === chosen.id);
    const isFirstPlay = entry?.listenCount === 0;

    PlaylistFairnessEngine.recordPlayed(chosen.id);

    return {
      song: chosen,
      transition,
      djComment: buildComment(chosen, transition, isFirstPlay ?? false),
    };
  },

  onReaction(genre: string, reaction: FeedbackReaction): void {
    TrendLearningEngine.record(genre, reaction);
  },
};

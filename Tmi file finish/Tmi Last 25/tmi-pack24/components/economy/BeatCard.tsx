'use client';
// BeatCard.tsx — Single beat in marketplace: preview + license buttons
// Copilot wires: useBeatPreview(beatId), useLicenseBeat(beatId)
// Proof: play preview button works, license modal opens with correct pricing
export function BeatCard({ id, title, producerName, producerSlug, genre, bpm, key, basicPrice, premiumPrice, previewUrl }: {
  id:string; title:string; producerName:string; producerSlug:string;
  genre:string; bpm:number; key?:string; basicPrice:number; premiumPrice:number; previewUrl:string;
}) {
  return (
    <div className="tmi-beat-card">
      <button className="tmi-beat-card__play" aria-label={`Preview ${title}`} data-preview={previewUrl}>
        ▶
      </button>
      <div className="tmi-beat-card__info">
        <span className="tmi-beat-card__title">{title}</span>
        <a href={`/producers/${producerSlug}`} className="tmi-beat-card__producer">{producerName}</a>
        <div className="tmi-beat-card__meta">
          <span>{genre}</span>
          <span>{bpm} BPM</span>
          {key && <span>{key}</span>}
        </div>
      </div>
      <div className="tmi-beat-card__license">
        <button className="tmi-btn-ghost tmi-btn--sm" data-license="basic">${basicPrice} MP3</button>
        <button className="tmi-btn-primary tmi-btn--sm" data-license="premium">${premiumPrice} WAV</button>
      </div>
    </div>
  );
}

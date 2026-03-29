'use client';
// LiveStartCard.tsx — Feed card: Artist X just went live
// Copilot wires: data from activity feed, useRoomJoin(roomId)
// Proof: card shows artist info, Join Now button routes to room
export function LiveStartCard({ artistName, artistSlug, roomTitle, roomType, roomId, viewerCount }: {
  artistName:string; artistSlug:string; roomTitle:string;
  roomType:string; roomId:string; viewerCount:number;
}) {
  return (
    <div className="tmi-feed-card tmi-feed-card--live">
      <span className="tmi-live-badge">● LIVE</span>
      <div className="tmi-feed-card__info">
        <span className="tmi-feed-card__title">{artistName} is live</span>
        <span className="tmi-feed-card__sub">{roomTitle} · {roomType} · {viewerCount} watching</span>
      </div>
      <a href={`/${roomType.toLowerCase()}?roomId=${roomId}`} className="tmi-btn-primary tmi-btn--sm">
        Join Now
      </a>
    </div>
  );
}

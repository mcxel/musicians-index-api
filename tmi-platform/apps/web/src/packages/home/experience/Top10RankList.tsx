import Link from "next/link";
import type { TopArtistFaceEntry } from "./top10FaceData";
import { resolveCtaPath } from "@/lib/ctaContractMap";

type Top10RankListProps = {
  entries: TopArtistFaceEntry[];
};

export default function Top10RankList({ entries }: Top10RankListProps) {
  return (
    <aside className="top10-rank-list top10-rank-list--compact">
      <h3 className="top10-rank-list__title">
        Ranked Listing
      </h3>
      <ul className="top10-rank-list__items">
        {entries.map((artist) => {
          const profileHref = resolveCtaPath("artist-card-profile", { slug: artist.id });
          return (
            <li key={artist.id} className="top10-rank-list__item">
              <div className="top10-rank-list__left">
                <span className="top10-rank-list__rank">
                  {artist.rank}
                </span>
                <Link
                  href={profileHref}
                  className="top10-rank-list__link"
                >
                  {artist.name}
                </Link>
              </div>
              <span className="top10-rank-list__score">{artist.score}</span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}


import ArtistHeader from "@/components/artist/ArtistHeader";
import ArtistBio from "@/components/artist/ArtistBio";
import ArtistMusic from "@/components/artist/ArtistMusic";
import ArtistAlbums from "@/components/artist/ArtistAlbums";
import ArtistVideos from "@/components/artist/ArtistVideos";
import ArtistArticles from "@/components/artist/ArtistArticles";
import ArtistShows from "@/components/artist/ArtistShows";
import ArtistSponsors from "@/components/artist/ArtistSponsors";
import ArtistComments from "@/components/artist/ArtistComments";
import ArtistStats from "@/components/artist/ArtistStats";

export default function ArtistProfilePage() {
  return (
    <div style={{ padding: "40px", color: "white" }}>
      <ArtistHeader />
      <ArtistBio />
      <ArtistMusic />
      <ArtistAlbums />
      <ArtistVideos />
      <ArtistArticles />
      <ArtistShows />
      <ArtistSponsors />
      <ArtistComments />
      <ArtistStats />
    </div>
  );
}

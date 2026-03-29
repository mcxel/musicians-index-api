import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

export default function TrendingArtists() {
  return (
    <Card>
      <SectionTitle title="Trending Artists" />
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        <li>Artist X</li>
        <li>Artist Y</li>
        <li>Artist Z</li>
      </ul>
    </Card>
  );
}

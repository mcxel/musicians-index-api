import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

export default function Top10Chart() {
  const songs = [
    "Song One",
    "Song Two",
    "Song Three",
    "Song Four",
    "Song Five",
  ];
  return (
    <Card>
      <SectionTitle title="Top 10 Chart" />
      <ol>
        {songs.map((song, index) => (
          <li key={index} style={{ marginBottom: "8px" }}>
            {song}
          </li>
        ))}
      </ol>
    </Card>
  );
}

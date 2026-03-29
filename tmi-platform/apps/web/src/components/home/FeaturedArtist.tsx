import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

export default function FeaturedArtist() {
  return (
    <Card>
      <SectionTitle title="Featured Artist" />
      <div style={{ display: "flex", gap: "15px" }}>
        <div
          style={{
            width: "120px",
            height: "120px",
            background: "#111",
          }}
        />
        <div>
          <h3>Artist Name</h3>
          <p>Short artist description goes here. This will later come from the database and articles.</p>
        </div>
      </div>
    </Card>
  );
}

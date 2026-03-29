import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

export default function SponsorStrip() {
  return (
    <Card>
      <SectionTitle title="Sponsored by" />
      <span style={{ color: '#0ff' }}>Your Brand Here</span>
    </Card>
  );
}

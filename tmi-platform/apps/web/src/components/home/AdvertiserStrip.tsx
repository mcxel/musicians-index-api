import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

export default function AdvertiserStrip() {
  return (
    <Card>
      <SectionTitle title="Advertiser" />
      <span style={{ color: '#0ff' }}>Your Ad Here</span>
    </Card>
  );
}

import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

export default function ContestBanner() {
  return (
    <Card>
      <SectionTitle title="Contest Banner" />
      <div style={{ fontWeight: 'bold', color: '#0ff' }}>
        Enter the Spring Songwriting Contest!
      </div>
      <div style={{ fontSize: '12px', marginTop: 4 }}>
        Prizes, exposure, and more. <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Learn more</span>
      </div>
    </Card>
  );
}

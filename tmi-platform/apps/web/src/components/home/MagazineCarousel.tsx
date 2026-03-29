import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

export default function MagazineCarousel() {
  return (
    <Card>
      <SectionTitle title="Magazine Carousel" />
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ width: 80, height: 80, background: '#111', borderRadius: 8 }} />
        <div style={{ width: 80, height: 80, background: '#111', borderRadius: 8 }} />
        <div style={{ width: 80, height: 80, background: '#111', borderRadius: 8 }} />
      </div>
    </Card>
  );
}

import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

export default function Interviews() {
  return (
    <Card>
      <SectionTitle title="Interviews" />
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        <li>Q&A with Artist A</li>
        <li>Behind the Scenes: Band B</li>
        <li>Producer Spotlight: C</li>
      </ul>
    </Card>
  );
}

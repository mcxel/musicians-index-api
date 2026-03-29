import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

export default function LiveShows() {
  return (
    <Card>
      <SectionTitle title="Live Shows" />
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        <li>March 30: Artist X @ Venue 1</li>
        <li>April 2: Artist Y @ Venue 2</li>
        <li>April 10: Artist Z @ Venue 3</li>
      </ul>
    </Card>
  );
}

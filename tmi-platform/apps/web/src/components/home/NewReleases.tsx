import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

export default function NewReleases() {
  return (
    <Card>
      <SectionTitle title="New Releases" />
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        <li>Album One by Artist A</li>
        <li>Album Two by Artist B</li>
        <li>Album Three by Artist C</li>
      </ul>
    </Card>
  );
}

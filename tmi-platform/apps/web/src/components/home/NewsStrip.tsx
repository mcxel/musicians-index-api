import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

export default function NewsStrip() {
  return (
    <Card>
      <SectionTitle title="Latest News" />
      <div>
        New album releases, tour announcements, interviews and more…
      </div>
    </Card>
  );
}

import HomepageSectionJumpNav from '@/components/home/HomepageSectionJumpNav';
import EditorialBelt from '@/components/home/belts/EditorialBelt';

export default function HomePage1() {
  return (
    <div>
      <HomepageSectionJumpNav
        sections={[
          { id: 'home1-cover', label: 'Cover' },
          { id: 'home1-crown', label: 'Crown' },
          { id: 'home1-editors-pick', label: 'Editor Pick' },
        ]}
      />
      <EditorialBelt />
    </div>
  );
}

import { MagazinePageFlipRuntime } from '@/components/magazine/MagazinePageFlipRuntime';
import { MAGAZINE_FULL_ROTATION_SCENES } from '../1/page';

export default function Home12Page() {
  return (
    <MagazinePageFlipRuntime
      scenes={MAGAZINE_FULL_ROTATION_SCENES}
      initialIndex={1}
    />
  );
}

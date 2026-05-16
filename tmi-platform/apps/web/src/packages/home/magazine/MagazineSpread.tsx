import type { ReactNode } from "react";
import SpreadSeam from "./SpreadSeam";

type MagazineSpreadProps = {
  left: ReactNode;
  right: ReactNode;
};

export default function MagazineSpread({ left, right }: MagazineSpreadProps) {
  return (
    <section className="mag-spread" aria-label="Magazine Open Spread" data-mag-zone="spread">
      <div className="mag-spread__page mag-spread__page--left mag-left" data-mag-zone="left-page">
        <div className="mag-spread__paper">{left}</div>
      </div>
      <SpreadSeam />
      <div className="mag-spread__page mag-spread__page--right mag-right" data-mag-zone="right-page">
        <div className="mag-spread__paper">{right}</div>
      </div>
    </section>
  );
}

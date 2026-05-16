import type { ReactNode } from "react";
import IssueTabs from "./IssueTabs";
import PageStackEdge from "./PageStackEdge";

type MagazineShellProps = {
  cover: ReactNode;
  spread: ReactNode;
};

export default function MagazineShell({ cover, spread }: MagazineShellProps) {
  return (
    <div className="mag-shell" data-mag-state="open" data-mag-zone="shell">
      <div className="mag-shell__edge-layer">
        <IssueTabs />
        <PageStackEdge />
      </div>
      <div className="mag-shell__object">
        <div className="mag-cover-zone mag-shell__cover" data-mag-zone="cover">
          {cover}
        </div>
        <div className="mag-shell__spread" data-mag-zone="spread">
          {spread}
        </div>
      </div>
      <div className="mag-page-stack" data-mag-zone="page-stack" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

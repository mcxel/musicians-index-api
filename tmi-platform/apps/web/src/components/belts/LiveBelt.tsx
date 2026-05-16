import type { ReactNode } from "react";
import TmiHardFrame from "@/components/frames/TmiHardFrame";
import TmiSectionLabel from "@/components/typography/TmiSectionLabel";

type LiveBeltProps = {
  children: ReactNode;
  title?: string;
};

export default function LiveBelt({ children, title = "Live Belt" }: LiveBeltProps) {
  return (
    <TmiHardFrame
      accent="#ff2daa"
      header={<TmiSectionLabel color="#ff2daa">{title}</TmiSectionLabel>}
      footer={<span>Live Window Grid</span>}
    >
      {children}
    </TmiHardFrame>
  );
}

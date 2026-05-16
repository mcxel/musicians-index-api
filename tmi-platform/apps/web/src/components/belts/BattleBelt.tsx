import type { ReactNode } from "react";
import TmiHardFrame from "@/components/frames/TmiHardFrame";
import TmiSectionLabel from "@/components/typography/TmiSectionLabel";

type BattleBeltProps = {
  children: ReactNode;
  title?: string;
};

export default function BattleBelt({ children, title = "Battle Belt" }: BattleBeltProps) {
  return (
    <TmiHardFrame
      accent="#ff6b35"
      header={<TmiSectionLabel color="#ff6b35">{title}</TmiSectionLabel>}
      footer={<span>Competition Rail</span>}
    >
      {children}
    </TmiHardFrame>
  );
}

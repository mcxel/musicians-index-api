import type { ReactNode } from "react";
import TmiHardFrame from "@/components/frames/TmiHardFrame";
import TmiSectionLabel from "@/components/typography/TmiSectionLabel";

type TmiMarketplaceBeltProps = {
  children: ReactNode;
  title?: string;
};

export default function TmiMarketplaceBelt({ children, title = "Marketplace Belt" }: TmiMarketplaceBeltProps) {
  return (
    <TmiHardFrame
      accent="#00ff88"
      header={<TmiSectionLabel color="#00ff88">{title}</TmiSectionLabel>}
      footer={<span>Commerce Rail</span>}
    >
      {children}
    </TmiHardFrame>
  );
}
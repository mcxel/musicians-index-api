import type { ReactNode } from "react";
import TmiHardFrame from "@/components/frames/TmiHardFrame";
import TmiSectionLabel from "@/components/typography/TmiSectionLabel";

type SponsorBeltProps = {
  children: ReactNode;
  title?: string;
};

export default function SponsorBelt({ children, title = "Sponsor Belt" }: SponsorBeltProps) {
  return (
    <TmiHardFrame
      accent="#ffd700"
      header={<TmiSectionLabel color="#ffd700">{title}</TmiSectionLabel>}
      footer={<span>Sponsor Inventory</span>}
    >
      {children}
    </TmiHardFrame>
  );
}

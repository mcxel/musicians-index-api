import type { ReactNode } from "react";
import TmiHardFrame from "@/components/frames/TmiHardFrame";
import TmiSectionLabel from "@/components/typography/TmiSectionLabel";

type DiscoveryBeltProps = {
  children: ReactNode;
  title?: string;
};

export default function DiscoveryBelt({ children, title = "Discovery Belt" }: DiscoveryBeltProps) {
  return (
    <TmiHardFrame
      accent="#00ffff"
      header={<TmiSectionLabel color="#00ffff">{title}</TmiSectionLabel>}
      footer={<span>Explore Routes</span>}
    >
      {children}
    </TmiHardFrame>
  );
}

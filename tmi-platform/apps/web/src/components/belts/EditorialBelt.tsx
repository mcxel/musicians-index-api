import type { ReactNode } from "react";
import TmiHardFrame from "@/components/frames/TmiHardFrame";
import TmiHeadline from "@/components/typography/TmiHeadline";
import TmiSectionLabel from "@/components/typography/TmiSectionLabel";

type EditorialBeltProps = {
  children: ReactNode;
  label?: string;
  title?: string;
};

export default function EditorialBelt({
  children,
  label = "Editorial Belt",
  title = "Features And Storylines",
}: EditorialBeltProps) {
  return (
    <TmiHardFrame
      accent="#aa2dff"
      header={<TmiSectionLabel color="#aa2dff">{label}</TmiSectionLabel>}
      footer={<span>Issue Rail</span>}
    >
      <div style={{ display: "grid", gap: 10 }}>
        <TmiHeadline as="h3" color="#ffffff" style={{ fontSize: 30 }}>{title}</TmiHeadline>
        {children}
      </div>
    </TmiHardFrame>
  );
}

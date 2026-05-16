import { TMI_MAGAZINE_Z_INDEX } from "@/lib/magazine/tmiMagazineZIndex";

type Props = {
  className?: string;
};

export default function TmiMagazineInteractionLayer({ className }: Props) {
  return (
    <div
      className={["absolute inset-0 rounded-xl", className ?? ""].join(" ")}
      style={{ zIndex: TMI_MAGAZINE_Z_INDEX.interaction }}
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-cyan-300/20" />
      <div className="pointer-events-none absolute left-[8%] top-[14%] h-[72%] w-[2%] rounded bg-cyan-200/10" />
      <div className="pointer-events-none absolute right-[8%] top-[14%] h-[72%] w-[2%] rounded bg-fuchsia-200/10" />
    </div>
  );
}

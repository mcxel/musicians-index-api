import { TMI_MAGAZINE_LAYER_STACK } from "@/lib/magazine/tmiMagazineLayerModel";

type Props = {
  className?: string;
};

export default function TmiMagazineBackgroundLayer({ className }: Props) {
  const layer = TMI_MAGAZINE_LAYER_STACK.find((item) => item.key === "background");

  return (
    <div className={["pointer-events-none absolute inset-0 overflow-hidden rounded-xl", className ?? ""].join(" ")} style={{ zIndex: layer?.zIndex ?? 0 }}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(39,245,255,0.34),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(255,230,74,0.22),transparent_45%),radial-gradient(circle_at_75%_80%,rgba(255,64,220,0.3),transparent_45%),linear-gradient(155deg,#070b1f_0%,#120523_46%,#090d19_100%)]" />
      <div className="absolute -left-12 top-10 h-36 w-36 rotate-12 border border-cyan-300/35 bg-cyan-300/10" />
      <div className="absolute right-8 top-20 h-32 w-32 rotate-45 border border-fuchsia-300/35 bg-fuchsia-400/10" />
      <div className="absolute bottom-8 left-1/3 h-24 w-24 -rotate-12 border border-yellow-300/35 bg-yellow-300/10" />
      <div className="absolute left-[12%] top-[22%] h-20 w-[2px] rotate-[22deg] bg-yellow-300/55" />
      <div className="absolute right-[18%] top-[30%] h-24 w-[2px] -rotate-[28deg] bg-cyan-300/55" />
      <div className="absolute left-[40%] top-[16%] h-[4px] w-[4px] rounded-full bg-fuchsia-300/70" />
      <div className="absolute left-[62%] top-[26%] h-[3px] w-[3px] rounded-full bg-cyan-200/80" />
      <div className="absolute left-[25%] top-[66%] h-[5px] w-[5px] rounded-full bg-yellow-200/80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_78%,rgba(0,0,0,0.45),transparent_46%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />
    </div>
  );
}

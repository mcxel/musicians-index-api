import type { CSSProperties, ReactNode } from "react";
import ShapeFrame from "@/components/ui/ShapeFrame";
import { shapeClipPath, type ShapeVariant } from "./shapes";

type CardFrameProps = {
  title: string;
  badge?: string;
  shape?: ShapeVariant;
  glow?: "cyan" | "magenta" | "red" | "gold" | "green";
  className?: string;
  children?: ReactNode;
};

export default function CardFrame({
  title,
  badge,
  shape = "angled",
  glow = "cyan",
  className,
  children,
}: CardFrameProps) {
  const style = {
    clipPath: shapeClipPath(shape),
  } as CSSProperties;

  return (
    <article
      className={`card-frame homev2-card homev2-card--${glow} ${className ?? ""}`.trim()}
      data-card-title={title}
      style={style}
    >
      <span className="homev2-card__halo" aria-hidden />
      <span className="homev2-card__glass" aria-hidden />
      {badge ? (
        <span className="homev2-card__badge">
          <ShapeFrame variant="badge" className="shape-frame--badge">
            {badge}
          </ShapeFrame>
        </span>
      ) : null}
      <div className="homev2-card__inner">
        <h3 className="homev2-card__title">{title}</h3>
        <div className="homev2-card__body">{children}</div>
      </div>
    </article>
  );
}

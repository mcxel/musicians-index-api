type PageRuffleTransitionProps = {
  active: boolean;
};

const RUFFLE_STYLE = `
@keyframes pageRuffleLift {
  0% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); opacity: 0; }
  14% { transform: translate3d(0, -6px, 0) rotate(-0.25deg) scale(1.008); opacity: 1; }
  36% { transform: translate3d(0, -14px, 0) rotate(-0.85deg) scale(1.018); opacity: 1; }
  62% { transform: translate3d(-10px, -18px, 0) rotate(-1.5deg) scale(1.026); opacity: 0.94; }
  100% { transform: translate3d(-18px, -20px, 0) rotate(-2.25deg) scale(1.03); opacity: 0; }
}

@keyframes pageRuffleEdge {
  0% { transform: translateX(0) skewY(0deg); opacity: 0; }
  20% { transform: translateX(1px) skewY(-1deg); opacity: 0.75; }
  48% { transform: translateX(-2px) skewY(1.4deg); opacity: 0.95; }
  72% { transform: translateX(3px) skewY(-1.2deg); opacity: 0.7; }
  100% { transform: translateX(-6px) skewY(0deg); opacity: 0; }
}

@keyframes pageRuffleSpine {
  0% { transform: perspective(1200px) rotateY(0deg) scaleX(1); opacity: 0; }
  26% { transform: perspective(1200px) rotateY(-10deg) scaleX(1.04); opacity: 0.7; }
  56% { transform: perspective(1200px) rotateY(-18deg) scaleX(1.08); opacity: 0.92; }
  100% { transform: perspective(1200px) rotateY(-24deg) scaleX(1.12); opacity: 0; }
}

@keyframes pageRuffleFlicker {
  0%, 100% { opacity: 0; }
  18% { opacity: 0.18; }
  24% { opacity: 0.04; }
  38% { opacity: 0.22; }
  42% { opacity: 0.08; }
  54% { opacity: 0.28; }
  65% { opacity: 0.1; }
}

@keyframes pageRuffleShadow {
  0% { transform: translateY(0) scaleX(1); opacity: 0; }
  34% { transform: translateY(8px) scaleX(1.08); opacity: 0.36; }
  70% { transform: translateY(14px) scaleX(1.22); opacity: 0.54; }
  100% { transform: translateY(18px) scaleX(1.3); opacity: 0; }
}
`;

export default function PageRuffleTransition({ active }: PageRuffleTransitionProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: RUFFLE_STYLE }} />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: active ? 1 : 0,
          zIndex: 90,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 18,
            background: "linear-gradient(180deg, rgba(245,238,220,0.08), rgba(255,255,255,0.02) 28%, rgba(0,0,0,0.16) 100%)",
            animation: active ? "pageRuffleLift 640ms cubic-bezier(.22,.8,.2,1) forwards" : "none",
            transformOrigin: "42px 50%",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 16,
            top: 0,
            bottom: 0,
            width: 62,
            background: "linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03) 35%, rgba(0,0,0,0.24) 100%)",
            filter: "blur(1px)",
            animation: active ? "pageRuffleSpine 560ms cubic-bezier(.24,.84,.3,1) forwards" : "none",
            transformOrigin: "left center",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 18,
            right: 10,
            bottom: 18,
            width: 18,
            background: "repeating-linear-gradient(180deg, rgba(255,255,255,0.34) 0 2px, rgba(226,214,189,0.22) 2px 5px, rgba(0,0,0,0) 5px 9px)",
            boxShadow: "-8px 0 22px rgba(255,255,255,0.08)",
            animation: active ? "pageRuffleEdge 520ms cubic-bezier(.2,.82,.34,1) forwards" : "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(100deg, transparent 16%, rgba(255,255,255,0.24) 42%, rgba(255,255,255,0.05) 55%, transparent 72%)",
            mixBlendMode: "screen",
            animation: active ? "pageRuffleFlicker 480ms linear forwards" : "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "16%",
            right: "11%",
            bottom: -8,
            height: 28,
            borderRadius: "999px",
            background: "rgba(0,0,0,0.52)",
            filter: "blur(12px)",
            animation: active ? "pageRuffleShadow 620ms cubic-bezier(.22,.8,.2,1) forwards" : "none",
          }}
        />
      </div>
    </>
  );
}

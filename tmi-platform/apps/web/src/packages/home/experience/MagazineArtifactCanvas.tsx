import { motion } from "framer-motion";

export default function MagazineArtifactCanvas() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(34,211,238,0.22),transparent_45%),radial-gradient(circle_at_82%_82%,rgba(217,70,239,0.2),transparent_40%),linear-gradient(140deg,rgba(8,10,25,0.86),rgba(3,6,15,0.95))]" />

      <motion.span
        className="absolute -left-10 top-6 h-48 w-48 rounded-full border border-cyan-300/25"
        animate={{ x: [0, 24, 0], y: [0, -8, 0], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="absolute right-6 top-12 h-32 w-32 rounded-xl border border-fuchsia-300/20"
        animate={{ rotate: [0, 8, 0], y: [0, 12, 0], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="absolute bottom-6 left-1/3 h-24 w-64 rounded-full border border-emerald-300/20"
        animate={{ x: [0, 14, 0], opacity: [0.2, 0.45, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.35)_100%)]" />
    </div>
  );
}

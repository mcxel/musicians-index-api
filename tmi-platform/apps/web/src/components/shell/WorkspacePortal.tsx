"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import MagazineExperienceRuntime from "@/components/magazine/MagazineExperienceRuntime";
import AvatarStudioExperience from "@/components/avatar/AvatarStudioExperience";

export interface WorkspacePortalProps {
  isOpen: boolean;
  workspaceId: string | null;
  onClose: () => void;
}

export default function WorkspacePortal({
  isOpen,
  workspaceId,
  onClose,
}: WorkspacePortalProps) {
  if (!isOpen || !workspaceId) return null;

  const isMagazine = workspaceId === "MAGAZINE";
  const isAvatar = workspaceId === "AVATAR" || workspaceId === "AVATAR_STUDIO";

  const getWidthClass = () => {
    if (isAvatar) return "w-[780px]";
    if (isMagazine) return "w-[680px]";
    return "w-96";
  };

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className={`absolute top-10 right-0 bottom-16 ${getWidthClass()} z-50 bg-slate-900/95 backdrop-blur-2xl border-l border-cyan-500/30 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto`}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <h3 className="text-sm font-black text-cyan-400 tracking-widest">
            CONCIERGE WORKSPACE :: {workspaceId}
          </h3>
          <button
            onClick={onClose}
            className="text-xs font-bold text-white/50 hover:text-white"
          >
            ✕ CLOSE
          </button>
        </div>

        {isAvatar ? (
          <AvatarStudioExperience onClose={onClose} />
        ) : isMagazine ? (
          <MagazineExperienceRuntime onClose={onClose} />
        ) : (
          <div className="flex-1 my-6 flex items-center justify-center text-white/60 text-xs font-mono text-center px-4">
            [Persistent Workspace Drawer for {workspaceId} — Venue & Audio playback continue seamlessly]
          </div>
        )}

        <div className="border-t border-white/10 pt-4 text-right mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg text-xs font-bold text-white"
          >
            DOCK WORKSPACE
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

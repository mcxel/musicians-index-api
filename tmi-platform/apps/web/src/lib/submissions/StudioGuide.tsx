"use client";

import { motion, AnimatePresence } from "framer-motion";
import React from "react";

interface StudioGuideProps {
  isVisible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

/**
 * Temporary "pop-up notepad" to guide users, serving as an interim
 * solution until the full 3D Julius character is ready.
 * Per user request 2026-06-29.
 */
export function StudioGuide({ isVisible, title, message, onClose }: StudioGuideProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            position: "fixed",
            bottom: "90px", // Above the GlobalMediaController
            right: "20px",
            width: "320px",
            background: "rgba(20, 15, 35, 0.9)",
            backdropFilter: "blur(10px)",
            border: "1px solid #4A3F6D",
            borderRadius: "12px",
            padding: "16px",
            color: "white",
            zIndex: 1500,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ margin: 0, color: "#00C8FF", fontSize: "16px" }}>{title}</h4>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", fontSize: "20px", cursor: "pointer" }}>
              &times;
            </button>
          </div>
          <p style={{ marginTop: "8px", fontSize: "14px", lineHeight: "1.5", color: "#E0E0E0" }}>
            {message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
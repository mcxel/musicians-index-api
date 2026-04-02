"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import MagazineCarousel from "@/components/home/MagazineCarousel";
import NewsStrip from "@/components/home/NewsStrip";
import FeaturedArtist from "@/components/home/FeaturedArtist";
import Interviews from "@/components/home/Interviews";
import SponsorStrip from "@/components/home/SponsorStrip";
import NewReleases from "@/components/home/NewReleases";
import TrendingArtists from "@/components/home/TrendingArtists";
import LiveShows from "@/components/home/LiveShows";
import ContestBanner from "@/components/home/ContestBanner";
import AdvertiserStrip from "@/components/home/AdvertiserStrip";
import Top10Chart from "@/components/home/Top10Chart";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SECTION_COMPONENTS: Record<string, React.ComponentType<any>> = {
  MagazineCarousel,
  NewsStrip,
  FeaturedArtist,
  Interviews,
  SponsorStrip,
  NewReleases,
  TrendingArtists,
  LiveShows,
  ContestBanner,
  AdvertiserStrip,
  Top10Chart,
};

const SECTION_LABELS: Record<string, string> = {
  MagazineCarousel: "Magazine Carousel",
  NewsStrip: "News Strip",
  FeaturedArtist: "Featured Artist",
  Interviews: "Interviews",
  SponsorStrip: "Sponsor Strip",
  NewReleases: "New Releases",
  TrendingArtists: "Trending Artists",
  LiveShows: "Live Shows",
  ContestBanner: "Contest Banner",
  AdvertiserStrip: "Advertiser Strip",
  Top10Chart: "Top 10 Chart",
};

const DEFAULT_ORDER = [
  "MagazineCarousel",
  "FeaturedArtist",
  "Top10Chart",
  "NewsStrip",
  "SponsorStrip",
  "NewReleases",
  "TrendingArtists",
  "Interviews",
  "LiveShows",
  "ContestBanner",
  "AdvertiserStrip",
];

const STORAGE_KEY = "tmi_homepage_section_order_v1";

function loadOrder(): string[] {
  if (typeof window === "undefined") return DEFAULT_ORDER;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed.every((item) => typeof item === "string" && item in SECTION_COMPONENTS)
      ) {
        return parsed as string[];
      }
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_ORDER;
}

function saveOrder(order: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  } catch {
    // ignore storage errors
  }
}

interface SortableItemProps {
  id: string;
  editMode: boolean;
}

function SortableItem({ id, editMode }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const Component = SECTION_COMPONENTS[id];

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
        position: "relative",
        zIndex: isDragging ? 999 : "auto",
      }}
    >
      {editMode && (
        <div
          {...attributes}
          {...listeners}
          title={`Drag to reorder: ${SECTION_LABELS[id]}`}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 20,
            width: 30,
            height: 30,
            borderRadius: 6,
            background: "rgba(0,255,255,0.14)",
            border: "1px solid rgba(0,255,255,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "grab",
            fontSize: 14,
            color: "#00FFFF",
            userSelect: "none",
            backdropFilter: "blur(4px)",
          }}
        >
          ⠿
        </div>
      )}
      {editMode && (
        <div style={{
          position: "absolute",
          top: 8,
          left: 12,
          zIndex: 20,
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "rgba(0,255,255,0.5)",
          pointerEvents: "none",
        }}>
          {SECTION_LABELS[id]}
        </div>
      )}
      {Component && <Component />}
    </div>
  );
}

export default function HomepageCanvas() {
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER);
  const [editMode, setEditMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setOrder(loadOrder());
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrder((prev) => {
        const oldIdx = prev.indexOf(active.id as string);
        const newIdx = prev.indexOf(over.id as string);
        const next = arrayMove(prev, oldIdx, newIdx);
        saveOrder(next);
        return next;
      });
    }
  }, []);

  const resetOrder = useCallback(() => {
    setOrder(DEFAULT_ORDER);
    saveOrder(DEFAULT_ORDER);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ position: "relative" }}>
      {/* Toolbar */}
      <motion.div
        animate={{
          background: editMode
            ? "rgba(0,255,255,0.05)"
            : "transparent",
          borderColor: editMode
            ? "rgba(0,255,255,0.2)"
            : "rgba(255,255,255,0.03)",
        }}
        transition={{ duration: 0.3 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
          padding: "8px 14px",
          border: "1px solid rgba(255,255,255,0.03)",
          borderRadius: 8,
        }}
      >
        <AnimatePresence>
          {editMode && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              style={{
                fontSize: 9,
                color: "rgba(0,255,255,0.5)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                flex: 1,
              }}
            >
              ✦ EDIT MODE — Drag sections to reorder your homepage
            </motion.span>
          )}
        </AnimatePresence>

        {editMode && (
          <button
            onClick={resetOrder}
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.35)",
              borderRadius: 4,
              padding: "4px 10px",
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        )}

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setEditMode((e) => !e)}
          style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            padding: "5px 16px",
            borderRadius: 5,
            cursor: "pointer",
            background: editMode ? "#00FFFF" : "transparent",
            color: editMode ? "#000" : "#00FFFF",
            border: "1px solid rgba(0,255,255,0.4)",
            transition: "all 0.2s",
          }}
        >
          {editMode ? "✓ Done" : "✦ Customize Layout"}
        </motion.button>
      </motion.div>

      {/* Sortable canvas */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          {order.map((id) => (
            <SortableItem key={id} id={id} editMode={editMode} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

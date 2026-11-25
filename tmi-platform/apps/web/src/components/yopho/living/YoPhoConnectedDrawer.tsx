"use client";

/**
 * YoPho drawer shell — CREATE workspace vs MY YOPHOS collection.
 * Switching tabs does not destroy unsaved create state (§6286/§6293).
 */

import { useState } from "react";
import YoPhoCreatorWorkspace from "@/components/yopho/living/YoPhoCreatorWorkspace";
import YoPhoMyCollectionTab from "@/components/yopho/YoPhoMyCollectionTab";

export default function YoPhoConnectedDrawer({
  ownerId = "local",
}: {
  ownerId?: string;
}) {
  const [tab, setTab] = useState<"create" | "collection">("create");

  return (
    <section
      data-yopho-connected-drawer="1"
      data-testid="yopho-connected-drawer"
      style={{
        width: "100%",
        /* §20995-E: reserve vertical space so tab/content swaps do not jump the WORK column */
        minHeight: 360,
        maxHeight: "min(52vh, 560px)",
        overflowY: "auto",
        borderRadius: 14,
        border: "1px solid rgba(0, 255, 255, 0.35)",
        boxShadow: "0 0 35px rgba(0, 255, 255, 0.2)",
        background: "rgba(5,5,16,0.92)",
        padding: 12,
        boxSizing: "border-box",
      }}
    >
      <div
        role="tablist"
        aria-label="YoPho workspace"
        style={{ display: "flex", gap: 8, marginBottom: 12 }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "create"}
          data-testid="yopho-tab-create"
          onClick={() => setTab("create")}
          style={tabStyle(tab === "create")}
        >
          CREATE
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "collection"}
          data-testid="yopho-tab-my-yophos"
          onClick={() => setTab("collection")}
          style={tabStyle(tab === "collection")}
        >
          MY YOPHOS
        </button>
      </div>

      <div style={{ display: tab === "create" ? "block" : "none" }} data-testid="yopho-create-pane">
        <YoPhoCreatorWorkspace ownerId={ownerId} />
      </div>
      <div style={{ display: tab === "collection" ? "block" : "none" }} data-testid="yopho-collection-pane">
        <YoPhoMyCollectionTab ownerKey={ownerId} />
      </div>
    </section>
  );
}

function tabStyle(on: boolean) {
  return {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 8,
    border: on ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.15)",
    background: on ? "rgba(0,255,255,0.12)" : "transparent",
    color: on ? "#00FFFF" : "rgba(255,255,255,0.7)",
    fontWeight: 900,
    letterSpacing: "0.1em",
    fontSize: 11,
    cursor: "pointer",
    fontFamily: "inherit",
  } as const;
}

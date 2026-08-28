"use client";



/**

 * Overseer quick-control row: ops pills ending at APPROVE QUEUE,

 * then inline Command Switcher — routes to Intelligence Deck only (never TOP monitors).

 */



import type { CSSProperties } from "react";

import type { OverseerCenterViewId } from "@/components/admin/overseer/OverseerCommandViews";

import {

  commandViewToDeskPanel,

  focusIntelligenceWorkspace,

  scrollToIntelligenceDeck,

} from "@/lib/admin/overseerDeckConvergence";

import { scrollToControlDesk } from "@/lib/admin/overseerInspectBridge";



type OpsActionId =

  | "quick-dock"

  | "alerts"

  | "chain-pulse"

  | "start-meeting"

  | "summon"

  | "approve-queue";



type CommandAction = {

  id: OverseerCenterViewId;

  label: string;

  accent: string;

};



const OPS_PILLS: { id: OpsActionId; label: string; accent: string }[] = [

  { id: "quick-dock", label: "Quick Dock", accent: "#FFD700" },

  { id: "alerts", label: "Alerts", accent: "#FF6B8A" },

  { id: "chain-pulse", label: "Chain Pulse", accent: "#AA2DFF" },

  { id: "start-meeting", label: "Start Meeting", accent: "#00FFFF" },

  { id: "summon", label: "Summon", accent: "#FF2DAA" },

  { id: "approve-queue", label: "Approve Queue", accent: "#00FF88" },

];



const COMMAND_SWITCHER: CommandAction[] = [

  { id: "observatory", label: "Observatory", accent: "#00FFFF" },

  { id: "runtime-check", label: "Runtime Check", accent: "#00FF88" },

  { id: "certification", label: "Certification", accent: "#FFD700" },

  { id: "global-pulse", label: "Global Pulse", accent: "#AA2DFF" },

  { id: "venue-health", label: "Venue Health", accent: "#00FF88" },

  { id: "dynamics", label: "Dynamics", accent: "#FF2DAA" },

];



export type OverseerQuickControlRowProps = {

  activeIntelligenceView?: OverseerCenterViewId;

  onIntelligenceView: (view: OverseerCenterViewId) => void;

  onOpsAction?: (action: OpsActionId) => void;

};



function pillStyle(active: boolean, accent: string): CSSProperties {

  return {

    borderRadius: 999,

    border: active ? `1px solid ${accent}` : `1px solid ${accent}55`,

    background: active ? `${accent}22` : "rgba(0,0,0,0.35)",

    color: active ? accent : "rgba(255,255,255,0.72)",

    padding: "6px 11px",

    fontSize: 9,

    fontWeight: 900,

    letterSpacing: "0.08em",

    textTransform: "uppercase",

    cursor: "pointer",

    fontFamily: "inherit",

    whiteSpace: "nowrap",

    boxShadow: active ? `0 0 10px ${accent}40` : "none",

  };

}



export default function OverseerQuickControlRow({

  activeIntelligenceView = "media",

  onIntelligenceView,

  onOpsAction,

}: OverseerQuickControlRowProps) {

  const handleOps = (id: OpsActionId) => {

    if (id === "quick-dock") {

      document.querySelector("[data-overseer-monitor-wall]")?.scrollIntoView({ behavior: "smooth", block: "start" });

      onIntelligenceView("media");

      onOpsAction?.(id);

      return;

    }

    if (id === "approve-queue") {

      focusIntelligenceWorkspace("submissions");

      scrollToIntelligenceDeck("intelligence");

      onIntelligenceView("approve-queue");

      onOpsAction?.(id);

      return;

    }

    onOpsAction?.(id);

  };



  const handleCommand = (view: OverseerCenterViewId) => {

    const panel = commandViewToDeskPanel(view);

    focusIntelligenceWorkspace(panel);

    scrollToControlDesk();

    onIntelligenceView(view);

  };



  return (

    <div

      data-overseer-quick-control-row

      data-rail-target="intelligence-deck"

      style={{

        position: "relative",

        zIndex: 90,

        border: "1px solid rgba(255,215,0,0.28)",

        borderRadius: 10,

        background: "linear-gradient(180deg, rgba(43,24,34,0.92), rgba(12,6,14,0.96))",

        padding: "8px 10px",

        display: "flex",

        flexWrap: "wrap",

        alignItems: "center",

        gap: 6,

      }}

    >

      <span

        style={{

          fontSize: 8,

          fontWeight: 900,

          letterSpacing: "0.16em",

          color: "rgba(255,215,0,0.65)",

          marginRight: 2,

        }}

      >

        QUICK DOCK

      </span>



      {OPS_PILLS.map((pill) => {

        const active =

          (pill.id === "quick-dock" && activeIntelligenceView === "media") ||

          (pill.id === "approve-queue" && activeIntelligenceView === "approve-queue");

        return (

          <button

            key={pill.id}

            type="button"

            onClick={() => handleOps(pill.id)}

            style={pillStyle(active, pill.accent)}

          >

            {pill.label}

          </button>

        );

      })}



      <span

        aria-hidden

        style={{

          width: 1,

          alignSelf: "stretch",

          minHeight: 22,

          background: "rgba(255,215,0,0.35)",

          margin: "0 4px",

        }}

      />



      <span

        style={{

          fontSize: 8,

          fontWeight: 900,

          letterSpacing: "0.16em",

          color: "rgba(0,255,255,0.7)",

        }}

      >

        COMMAND → INTELLIGENCE

      </span>



      {COMMAND_SWITCHER.map((cmd) => (

        <button

          key={cmd.id}

          type="button"

          onClick={() => handleCommand(cmd.id)}

          style={pillStyle(activeIntelligenceView === cmd.id, cmd.accent)}

        >

          {cmd.label}

        </button>

      ))}

    </div>

  );

}



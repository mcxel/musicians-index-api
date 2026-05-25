import { NextRequest, NextResponse } from "next/server";
import {
  FIRST_BATTLE_SCRIPT_EMERGENCY,
  getBattleScriptLinesAtMinute,
  getBattleScriptStepAtMinute,
  type BattleScriptEmergency,
} from "@/lib/hosts/FirstBattleScriptEngine";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const minuteRaw = Number(searchParams.get("minute") ?? "0");
  const minute = Number.isFinite(minuteRaw) ? Math.max(0, Math.floor(minuteRaw)) : 0;
  const emergency = searchParams.get("emergency") as BattleScriptEmergency | null;

  if (emergency && emergency in FIRST_BATTLE_SCRIPT_EMERGENCY) {
    return NextResponse.json({
      mode: "emergency",
      emergency,
      line: FIRST_BATTLE_SCRIPT_EMERGENCY[emergency],
      generatedAt: Date.now(),
    });
  }

  const step = getBattleScriptStepAtMinute(minute);
  const lines = getBattleScriptLinesAtMinute(minute);

  return NextResponse.json({
    mode: "timeline",
    minute,
    phase: step.id,
    startMinute: step.startMinute,
    endMinute: step.endMinute,
    lines,
    generatedAt: Date.now(),
  });
}

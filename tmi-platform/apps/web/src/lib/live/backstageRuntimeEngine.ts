// BackstageRuntimeEngine — backstage operations, crew, production state

export type CrewRole = "producer" | "director" | "audio" | "lighting" | "camera" | "stage-manager" | "security";

export type CrewMember = {
  id: string;
  name: string;
  role: CrewRole;
  onDuty: boolean;
  stationId: string;
};

export type BackstageAlert = {
  id: string;
  severity: "info" | "warning" | "critical";
  message: string;
  timestamp: number;
  acknowledged: boolean;
};

export type BackstageState = {
  venueSlug: string;
  crew: CrewMember[];
  alerts: BackstageAlert[];
  productionActive: boolean;
  countdown: number | null; // seconds to showtime
  checklistComplete: boolean;
};

const backstageRegistry = new Map<string, BackstageState>();

function genId(): string {
  return `bs-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

export function getBackstageState(venueSlug: string): BackstageState {
  if (!backstageRegistry.has(venueSlug)) {
    backstageRegistry.set(venueSlug, {
      venueSlug,
      crew: [],
      alerts: [],
      productionActive: false,
      countdown: null,
      checklistComplete: false,
    });
  }
  return backstageRegistry.get(venueSlug)!;
}

export function addCrewMember(venueSlug: string, member: Omit<CrewMember, "onDuty">): CrewMember {
  const state = getBackstageState(venueSlug);
  const full: CrewMember = { ...member, onDuty: true };
  state.crew.push(full);
  return full;
}

export function startProduction(venueSlug: string, countdownSec = 0): BackstageState {
  const state = getBackstageState(venueSlug);
  state.productionActive = true;
  state.countdown = countdownSec > 0 ? countdownSec : null;
  return state;
}

export function stopProduction(venueSlug: string): void {
  const state = getBackstageState(venueSlug);
  state.productionActive = false;
  state.countdown = null;
}

export function raiseAlert(venueSlug: string, severity: BackstageAlert["severity"], message: string): BackstageAlert {
  const state = getBackstageState(venueSlug);
  const alert: BackstageAlert = { id: genId(), severity, message, timestamp: Date.now(), acknowledged: false };
  state.alerts.push(alert);
  return alert;
}

export function acknowledgeAlert(venueSlug: string, alertId: string): void {
  const state = getBackstageState(venueSlug);
  const alert = state.alerts.find((a) => a.id === alertId);
  if (alert) alert.acknowledged = true;
}

export function markChecklistComplete(venueSlug: string): void {
  getBackstageState(venueSlug).checklistComplete = true;
}

export function getActiveAlerts(venueSlug: string): BackstageAlert[] {
  return getBackstageState(venueSlug).alerts.filter((a) => !a.acknowledged);
}

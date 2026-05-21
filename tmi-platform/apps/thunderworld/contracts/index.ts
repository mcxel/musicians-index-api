export type ThunderworldWorkforceType = "cleanup" | "repair" | "emergency" | "event_staff";
export type ThunderworldCrowdPhase = "pre-show" | "group-round" | "finale";

export interface ThunderworldWorkforceDispatchContract {
  requestWorkforce(input: {
    requestType: ThunderworldWorkforceType;
    crowdPhase: ThunderworldCrowdPhase;
    workerCount: number;
    urgency: "normal" | "high" | "critical";
    notes?: string;
  }): Promise<{ accepted: boolean; hookId: string; targetModule: "willdoit" }>;
}

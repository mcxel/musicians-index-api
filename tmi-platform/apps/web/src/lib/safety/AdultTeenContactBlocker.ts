import { evaluateTeenContactPolicy, type ContactActor, type ContactChannel, type ContactPolicyDecision, type ContactTarget } from "@/lib/safety/TeenMessagingPolicyEngine";

export type ContactBlockInput = {
  source: string;
  channel: ContactChannel;
  actor: ContactActor;
  target: ContactTarget;
};

export function enforceAdultTeenContactBlock(input: ContactBlockInput): ContactPolicyDecision {
  return evaluateTeenContactPolicy(input);
}

export function requireAllowedContact(input: ContactBlockInput): ContactPolicyDecision {
  const decision = evaluateTeenContactPolicy(input);
  if (!decision.allowed) {
    throw new Error(decision.reason);
  }
  return decision;
}

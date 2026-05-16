/**
 * TeenAccountEngine
 * First-class teen account handling for fan and performer roles.
 */

export type TeenAccountRole = "fan_teen" | "performer_teen";
export type TeenConsentStatus = "pending" | "approved" | "rejected" | "revoked" | "expired";

export type TeenAccount = {
  userId: string;
  role: TeenAccountRole;
  displayName: string;
  email: string;
  dateOfBirthIso: string;
  age: number;
  guardianEmail: string;
  guardianConsentStatus: TeenConsentStatus;
  createdAtMs: number;
  updatedAtMs: number;
};

export type TeenCapability =
  | "view_public_rooms"
  | "join_fan_chat"
  | "vote_contests"
  | "buy_tickets"
  | "buy_beats"
  | "go_live"
  | "mint_nft"
  | "sell_tickets"
  | "publish_beats";

export type TeenCapabilityDecision = {
  allowed: boolean;
  reason: string;
};

let _teenAccountSeq = 0;

function computeAge(dateOfBirthIso: string, now = new Date()): number {
  const dob = new Date(dateOfBirthIso);
  if (Number.isNaN(dob.getTime())) return -1;
  let age = now.getFullYear() - dob.getFullYear();
  const monthDelta = now.getMonth() - dob.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

const BASE_CAPABILITIES: Record<TeenAccountRole, Set<TeenCapability>> = {
  fan_teen: new Set(["view_public_rooms", "join_fan_chat", "vote_contests", "buy_tickets", "buy_beats"]),
  performer_teen: new Set([
    "view_public_rooms",
    "join_fan_chat",
    "vote_contests",
    "buy_tickets",
    "buy_beats",
    "publish_beats",
  ]),
};

export class TeenAccountEngine {
  private readonly accounts: Map<string, TeenAccount> = new Map();

  registerTeenAccount(params: {
    role: TeenAccountRole;
    displayName: string;
    email: string;
    dateOfBirthIso: string;
    guardianEmail: string;
  }): TeenAccount | null {
    const age = computeAge(params.dateOfBirthIso);
    if (age < 13 || age >= 18) return null;

    const userId = `teen-${Date.now()}-${++_teenAccountSeq}`;
    const now = Date.now();

    const account: TeenAccount = {
      userId,
      role: params.role,
      displayName: params.displayName,
      email: params.email,
      dateOfBirthIso: params.dateOfBirthIso,
      age,
      guardianEmail: params.guardianEmail,
      guardianConsentStatus: "pending",
      createdAtMs: now,
      updatedAtMs: now,
    };

    this.accounts.set(userId, account);
    return account;
  }

  submitGuardianConsent(userId: string): void {
    const account = this.accounts.get(userId);
    if (!account) return;
    account.guardianConsentStatus = "pending";
    account.updatedAtMs = Date.now();
  }

  approveGuardianConsent(userId: string): void {
    const account = this.accounts.get(userId);
    if (!account) return;
    account.guardianConsentStatus = "approved";
    account.updatedAtMs = Date.now();
  }

  rejectGuardianConsent(userId: string): void {
    const account = this.accounts.get(userId);
    if (!account) return;
    account.guardianConsentStatus = "rejected";
    account.updatedAtMs = Date.now();
  }

  revokeGuardianConsent(userId: string): void {
    const account = this.accounts.get(userId);
    if (!account) return;
    account.guardianConsentStatus = "revoked";
    account.updatedAtMs = Date.now();
  }

  getAccount(userId: string): TeenAccount | null {
    return this.accounts.get(userId) ?? null;
  }

  canAccess(userId: string, capability: TeenCapability): TeenCapabilityDecision {
    const account = this.accounts.get(userId);
    if (!account) return { allowed: false, reason: "account not found" };

    if (account.guardianConsentStatus !== "approved") {
      return { allowed: false, reason: "guardian consent not approved" };
    }

    const allowedByRole = BASE_CAPABILITIES[account.role].has(capability);
    if (!allowedByRole) {
      return { allowed: false, reason: `capability '${capability}' not allowed for ${account.role}` };
    }

    // Teens cannot access direct monetization/broadcast features even for performer role.
    if (capability === "go_live" || capability === "mint_nft" || capability === "sell_tickets") {
      return { allowed: false, reason: "restricted until adult verification" };
    }

    return { allowed: true, reason: "allowed by teen policy" };
  }
}

export const teenAccountEngine = new TeenAccountEngine();

export type WorkforceQuantityMode =
  | 'SINGLE_WORKER'
  | 'DUAL_WORKERS'
  | 'SMALL_CREW'
  | 'FULL_CREW'
  | 'SPECIALIST_TEAM'
  | 'EMERGENCY_TEAM';

export type WorkforceFundingSource =
  | 'owner_support_budget'
  | 'operations_budget'
  | 'field_logistics_budget'
  | 'business_support_budget'
  | 'emergency_budget'
  | 'buildout_budget'
  | 'procurement_budget'
  | 'maintenance_budget'
  | 'cleaning_budget'
  | 'event_budget'
  | 'personal_reimbursement_budget';

export type WorkforceAccountingCategory =
  | 'BUSINESS_EXPENSE'
  | 'OWNER_SUPPORT'
  | 'FIELD_LOGISTICS'
  | 'REIMBURSEMENT'
  | 'MAINTENANCE'
  | 'CLEANING'
  | 'BUILDOUT'
  | 'PROCUREMENT'
  | 'EVENT_OPERATIONS'
  | 'PERSONAL_NONDEDUCTIBLE'
  | 'EMERGENCY_ASSISTANCE';

export const UNIVERSAL_WORKFORCE_RULES = {
  proofRequiredBeforeClose: true,
  proofRequiredBeforePay: true,
  contractsOnly: true,
  noCrossModuleRuntimeImports: true,
  isolatedAccountingTags: true,
  isolatedBudgets: true,
} as const;

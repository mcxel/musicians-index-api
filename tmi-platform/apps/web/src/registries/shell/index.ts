/**
 * Shell registries — NO ORPHAN FUNCTIONALITY platform law.
 */

export {
  type PowerState,
  type DetailState,
  type CallerType,
  type FunctionHealthRecord,
  registerFunctionHealth,
  registerCommandHealth,
  getFunctionHealth,
  getFunctionHealthByCommand,
  listFunctionHealth,
  recordFunctionInvocation,
  incrementFunctionCaller,
  setFunctionPowerState,
  getFunctionHealthCounts,
  exportFunctionHealthSnapshot,
} from "./FunctionHealthRegistry";

export {
  ORPHAN_ERROR_FAMILY,
  type OrphanErrorCode,
  type OrphanFinding,
  type OrphanAuditResult,
  classifyFunction,
  auditOrphanFunctions,
  resolvePowerStateForButton,
} from "./OrphanDetection";

export {
  type ButtonCommandDefinition,
  type ButtonOutcomeTrace,
  type CommandCallerTrace,
  type ShellSurface,
  type ShellCommandRole,
  SHELL_BUTTON_COMMANDS,
  getShellButtonCommands,
  getShellButtonByCommandId,
  getShellButtonByButtonId,
  traceButtonToOutcome,
  traceCommandToCallers,
  registerShellButtonHealth,
  getShellButtonHealthCounts,
} from "./ButtonCommandRegistry";

export {
  REBUILD_AUDIT_LAST_RUN,
  type RebuildSurfaceAuditEntry,
  runRebuildSurfaceAudit,
  getLastOrphanAuditResult,
  getRebuildAuditEntries,
  getOrphanAuditSnapshot,
  getOrphanFindingsBySurface,
  getZeroTargetCounts,
} from "./OrphanAuditLedger";

export { getOrphanAuditSnapshot as getSystemsOrphanHealthExport } from "./OrphanAuditLedger";

export {
  LEGACY_UI_LEDGER_LAST_RUN,
  type LegacyUiClass,
  type CanonicalUiTarget,
  type LegacyUiLedgerEntry,
  LEGACY_UI_CANNIBALIZATION_LEDGER,
  listLegacyUiByReachable,
  listCompetingLegacyUiStacks,
  getLegacyUiZeroTargetCounts,
} from "./LegacyUiCannibalizationLedger";

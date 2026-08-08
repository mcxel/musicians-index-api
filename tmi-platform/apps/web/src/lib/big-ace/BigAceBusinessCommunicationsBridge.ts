/**
 * Big Ace → Business Communications bridge (authority-envelope execution only).
 */
export {
  executeBigAceBusinessDirective,
  getBigAceBusinessActivitySummary,
  type BigAceBusinessDirective,
  type BigAceBusinessActivitySummary,
} from "@/lib/businessCommunications/BigAceBusinessCommunicationsRuntime";

export { businessCommunicationCommandBus } from "@/lib/businessCommunications";

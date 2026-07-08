// Compatibility alias: this legacy path now delegates to the canonical
// webhook handler at /api/stripe/webhook so only one fulfillment logic path exists.
export { dynamic, POST } from '../../stripe/webhook/route';

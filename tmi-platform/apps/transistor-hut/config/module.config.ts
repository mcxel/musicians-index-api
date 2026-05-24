import type { ModuleConfig } from '@tmi/module-runtime';

export const MODULE_CONFIG: ModuleConfig = {
  id: 'transistor-hut',
  name: 'Transistor Hut',
  version: '1.0.0',
  domain: 'transistorhut.berntout.com',
  port: 3011,
  runtime: {
    maxMemoryMb: 768,
    maxQueueDepth: 1200,
    healthCheckIntervalMs: 30000,
    checkpointIntervalMs: 60000,
  },
  stimulation: {
    enabled: process.env.STIMULATION_ENABLED === 'true',
    defaultMode: (process.env.STIMULATION_MODE as ModuleConfig['stimulation']['defaultMode']) ?? 'QUIET',
    defaultIntensity: Number(process.env.STIMULATION_INTENSITY ?? 0.3),
  },
  isolation: {
    allowedOrigins: ['https://transistorhut.berntout.com'],
    requireAuthFor: ['/api/admin/*', '/api/inventory/*'],
  },
  contracts: {
    emits: ['transistorhut.stock.updated', 'transistorhut.order.created', 'transistorhut.restock.requested', 'transistorhut.parts.reserved'],
    consumes: ['willdoit.dispatch.completed', 'llc.company.updated', 'admin.control.command', 'needacharge.parts.requested'],
  },
};

export const TRANSISTOR_HUT_LOGIC_BEHAVIORS = [
  'catalog.render',
  'inventory.reconcile',
  'order.intake',
  'restock.request',
  'pricing.sync',
  'pickup.schedule',
];

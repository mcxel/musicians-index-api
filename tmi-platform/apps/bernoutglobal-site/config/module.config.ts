import type { ModuleConfig } from "@tmi/module-runtime";

export const MODULE_CONFIG: ModuleConfig = {
  id: "web",           // maps to 'web' slot — bernoutglobal-site is the public face
  name: "BerntoutGlobal.com",
  version: "1.0.0",
  domain: "berntout.com",
  port: 3009,
  runtime: {
    maxMemoryMb: 512,
    maxQueueDepth: 1000,
    healthCheckIntervalMs: 30_000,
    checkpointIntervalMs: 120_000,
  },
  stimulation: {
    enabled: process.env.STIMULATION_ENABLED === "true",
    defaultMode:
      (process.env.STIMULATION_MODE as ModuleConfig["stimulation"]["defaultMode"]) ?? "QUIET",
    defaultIntensity: Number(process.env.STIMULATION_INTENSITY ?? 0.3),
  },
  isolation: {
    allowedOrigins: ["https://berntout.com", "https://www.berntout.com"],
    requireAuthFor: ["/api/press/*", "/api/admin/*"],
  },
  contracts: {
    emits: [
      "site.visitor.arrived",
      "site.product.clicked",
      "site.inquiry.submitted",
    ],
    consumes: [
      "llc.company.updated",
      "xxl.runtime.status",
    ],
  },
};

export const SITE_LOGIC_BEHAVIORS = [
  "nav.product_catalog_render",
  "press.kit_serve",
  "inquiry.form_submit",
  "product.nav_click",
  "blog.post_load",
  "partner.page_view",
];

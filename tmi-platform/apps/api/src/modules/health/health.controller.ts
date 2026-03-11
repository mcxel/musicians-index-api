import { Controller, Get, Res } from "@nestjs/common";
import type { Response } from "express";
import { PrismaService } from "../prisma/prisma.service";
import { Socket } from "node:net";
import { URL } from "node:url";
import {
  CACHE_CONNECT_TIMEOUT_MS,
  buildReadinessResponse,
  findMissingEnv,
  isReadinessDegradedForAlert,
  probeOptionalUpstreams,
  REQUIRED_BOOT_ENV,
  type ReadinessChecks,
} from "./readiness";

@Controller()
export class HealthController {
  private consecutiveDegradedCount = 0;
  private lastAlertAtMs = 0;

  private readonly alertThreshold = Number(process.env.READYZ_ALERT_THRESHOLD || 3);
  private readonly alertCooldownMs = Number(process.env.READYZ_ALERT_COOLDOWN_MS || 300_000);
  private readonly alertWebhookUrl = process.env.READYZ_ALERT_WEBHOOK_URL?.trim();

  constructor(private readonly prisma: PrismaService) {}

  @Get("healthz")
  healthz() {
    return {
      ok: true,
      service: "tmi-platform-api",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  private async runDatabaseCheck() {
    const started = Date.now();
    try {
      await this.prisma.$queryRawUnsafe("SELECT 1");
      return { ok: true, latencyMs: Date.now() - started };
    } catch (error) {
      return {
        ok: false,
        latencyMs: Date.now() - started,
        error: error instanceof Error ? error.message : "database check failed",
      };
    }
  }

  private async runCacheCheck() {
    const redisUrl = process.env.REDIS_URL?.trim();
    if (!redisUrl) {
      return { ok: true, configured: false, skipped: true };
    }

    const started = Date.now();
    try {
      const parsed = new URL(redisUrl);
      const host = parsed.hostname;
      const port = Number(parsed.port || 6379);

      await new Promise<void>((resolve, reject) => {
        const socket = new Socket();
        const timeoutMs = CACHE_CONNECT_TIMEOUT_MS;

        socket.setTimeout(timeoutMs);
        socket.once("connect", () => {
          socket.destroy();
          resolve();
        });
        socket.once("timeout", () => {
          socket.destroy();
          reject(new Error("cache connect timeout"));
        });
        socket.once("error", (err) => {
          socket.destroy();
          reject(err);
        });

        socket.connect(port, host);
      });

      return {
        ok: true,
        configured: true,
        latencyMs: Date.now() - started,
      };
    } catch (error) {
      return {
        ok: false,
        configured: true,
        latencyMs: Date.now() - started,
        error: error instanceof Error ? error.message : "cache check failed",
      };
    }
  }

  private async runOptionalUpstreamChecks() {
    const raw = process.env.READYZ_OPTIONAL_UPSTREAMS || "";
    return probeOptionalUpstreams(raw);
  }

  private async emitReadinessAlert(reasons: string[], payload: ReturnType<typeof buildReadinessResponse>) {
    // eslint-disable-next-line no-console
    console.error(
      `[readyz-alert] consecutive=${this.consecutiveDegradedCount} reasons=${reasons.join(",")} blockers=${payload.blockers.join(",")}`,
    );

    if (!this.alertWebhookUrl) {
      return;
    }

    try {
      await fetch(this.alertWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: payload.service,
          consecutiveDegradedCount: this.consecutiveDegradedCount,
          reasons,
          blockers: payload.blockers,
          timestamp: payload.timestamp,
        }),
      });
    } catch {
      // Alert delivery must not affect readiness endpoint behavior.
    }
  }

  private async maybeEmitReadinessAlert(payload: ReturnType<typeof buildReadinessResponse>) {
    const degraded = isReadinessDegradedForAlert(payload.checks, payload.ok);
    if (!degraded.degraded) {
      this.consecutiveDegradedCount = 0;
      return;
    }

    this.consecutiveDegradedCount += 1;
    if (this.consecutiveDegradedCount < this.alertThreshold) {
      return;
    }

    const now = Date.now();
    if (now - this.lastAlertAtMs < this.alertCooldownMs) {
      return;
    }

    this.lastAlertAtMs = now;
    await this.emitReadinessAlert(degraded.reasons, payload);
  }

  @Get("readyz")
  async readyz(@Res() res: Response) {
    const checks: ReadinessChecks = {
      env: {
        ok: true,
        missing: [],
      },
      database: { ok: false },
      cache: { ok: true, configured: false, skipped: true },
      upstreams: {
        ok: true,
        targets: [],
      },
    };

    checks.env.missing = findMissingEnv(REQUIRED_BOOT_ENV);
    checks.env.ok = checks.env.missing.length === 0;

    checks.database = await this.runDatabaseCheck();
    checks.cache = await this.runCacheCheck();
    checks.upstreams = await this.runOptionalUpstreamChecks();

    const payload = buildReadinessResponse(checks);
    await this.maybeEmitReadinessAlert(payload);

    return res.status(payload.ok ? 200 : 503).json(payload);
  }
}

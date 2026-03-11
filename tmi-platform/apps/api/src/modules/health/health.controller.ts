import { Controller, Get, Res } from "@nestjs/common";
import type { Response } from "express";
import { PrismaService } from "../prisma/prisma.service";
import { Socket } from "node:net";
import { URL } from "node:url";
import {
  buildReadinessResponse,
  findMissingEnv,
  REQUIRED_BOOT_ENV,
  type ReadinessChecks,
} from "./readiness";

@Controller()
export class HealthController {
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
        const timeoutMs = 500;

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
    const targets = raw
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    const results = await Promise.all(
      targets.map(async (url) => {
        const started = Date.now();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 700);

        try {
          const response = await fetch(url, {
            method: "GET",
            signal: controller.signal,
          });
          clearTimeout(timeout);
          return {
            url,
            ok: response.ok,
            latencyMs: Date.now() - started,
            error: response.ok ? undefined : `status ${response.status}`,
          };
        } catch (error) {
          clearTimeout(timeout);
          return {
            url,
            ok: false,
            latencyMs: Date.now() - started,
            error: error instanceof Error ? error.message : "upstream check failed",
          };
        }
      }),
    );

    return {
      ok: results.every((target) => target.ok),
      targets: results,
    };
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

    return res.status(payload.ok ? 200 : 503).json(payload);
  }
}

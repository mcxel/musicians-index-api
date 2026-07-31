/**
 * MainframeCoordinator — thin facade that routes to registered frameworks.
 *
 * No business logic. No god-class execution. Frameworks remain owners.
 * Request flow: validate envelope → lookup framework → invoke handler → audit.
 */

import type {
  AuditHook,
  FrameworkHandler,
  MainframeRequest,
  MainframeResponse,
  TelemetryHook,
} from "./types";

type RouteListener = (audit: AuditHook) => void;

class MainframeCoordinatorEngine {
  private handlers = new Map<string, FrameworkHandler>();
  private listeners = new Set<RouteListener>();
  private recentAudits: AuditHook[] = [];
  private readonly maxAudits = 100;

  /** Register a framework handler — frameworks call this at bootstrap */
  public registerHandler(frameworkId: string, handler: FrameworkHandler): void {
    this.handlers.set(frameworkId, handler);
  }

  public unregisterHandler(frameworkId: string): void {
    this.handlers.delete(frameworkId);
  }

  public hasHandler(frameworkId: string): boolean {
    return this.handlers.has(frameworkId);
  }

  public listRegisteredHandlers(): string[] {
    return Array.from(this.handlers.keys()).sort();
  }

  public subscribe(fn: RouteListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  public getRecentAudits(): readonly AuditHook[] {
    return this.recentAudits;
  }

  /**
   * Route a request to the target framework. Does not invent behavior when
   * no handler is registered — returns honest failure + recovery note.
   */
  public async route(request: MainframeRequest): Promise<MainframeResponse> {
    const frameworkId = request.target.frameworkId;
    const handler = this.handlers.get(frameworkId);

    const audit: AuditHook = {
      eventName: "mainframe.route",
      at: Date.now(),
      actor: request.actor,
      frameworkId,
      detail: {
        action: request.action,
        capability: request.target.capability,
        hasHandler: Boolean(handler),
      },
    };
    this.pushAudit(audit);

    if (!handler) {
      return {
        requestId: request.requestId,
        ok: false,
        error: `No handler registered for framework "${frameworkId}"`,
        audit,
        recovery: [
          {
            code: "FRAMEWORK_HANDLER_MISSING",
            message: `Framework ${frameworkId} is listed but has no Mainframe handler.`,
            suggestedAction:
              "Call MainframeCoordinator.registerHandler from that framework's bootstrap, or invoke the framework API directly.",
            rollbackStrategy: "noop",
          },
        ],
      };
    }

    try {
      const response = await handler(request);
      const telemetry: TelemetryHook[] = [
        {
          metric: "mainframe.route.ok",
          value: response.ok,
          tags: { frameworkId, action: request.action },
          at: Date.now(),
        },
        ...(response.telemetry ?? []),
      ];
      return {
        ...response,
        requestId: request.requestId,
        routedTo: frameworkId,
        audit: response.audit ?? audit,
        telemetry,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown handler error";
      return {
        requestId: request.requestId,
        ok: false,
        routedTo: frameworkId,
        error: message,
        audit,
        recovery: [
          {
            code: "FRAMEWORK_HANDLER_THREW",
            message,
            suggestedAction: "Inspect framework logs; do not retry blindly.",
            rollbackStrategy: "framework-owned",
          },
        ],
      };
    }
  }

  private pushAudit(audit: AuditHook) {
    this.recentAudits = [audit, ...this.recentAudits].slice(0, this.maxAudits);
    this.listeners.forEach((fn) => fn(audit));
  }
}

export const MainframeCoordinator = new MainframeCoordinatorEngine();
export default MainframeCoordinator;

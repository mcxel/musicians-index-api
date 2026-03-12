const http = require("http");

const host = process.env.READYZ_FIXTURE_HOST || "127.0.0.1";
const port = Number(process.env.READYZ_FIXTURE_PORT || "4011");
const mode = (process.env.READYZ_FIXTURE_MODE || "legacy").toLowerCase();
const status = Number(process.env.READYZ_FIXTURE_STATUS || "200");
const ok = (process.env.READYZ_FIXTURE_OK || "true").toLowerCase() === "true";
const invalidPayload = (process.env.READYZ_FIXTURE_INVALID_PAYLOAD || "false").toLowerCase() === "true";
const contractName = process.env.READYZ_FIXTURE_CONTRACT_NAME || "tmi-platform-readyz";
const contractVersion = process.env.READYZ_FIXTURE_CONTRACT_VERSION || "1.0";
const healthOk = (process.env.READYZ_FIXTURE_HEALTH_OK || "true").toLowerCase() === "true";
const healthStatus = Number(process.env.READYZ_FIXTURE_HEALTH_STATUS || "200");
const metricsMode = (process.env.READYZ_FIXTURE_METRICS_MODE || "pass").toLowerCase();
const metricsContractName =
  process.env.READYZ_FIXTURE_METRICS_CONTRACT_NAME || "tmi-platform-promotion-metrics";
const metricsContractVersion = process.env.READYZ_FIXTURE_METRICS_CONTRACT_VERSION || "1.0";

function buildMetricsPayload() {
  if (metricsMode === "invalid") {
    return { invalid: true };
  }

  if (metricsMode === "abort") {
    return {
      contract: {
        name: metricsContractName,
        version: metricsContractVersion,
      },
      canary: {
        attempts: 3,
        successes: 0,
        consecutiveSuccesses: 0,
        failures: 3,
      },
      fixture: true,
    };
  }

  if (metricsMode === "miss") {
    return {
      contract: {
        name: metricsContractName,
        version: metricsContractVersion,
      },
      canary: {
        attempts: 3,
        successes: 3,
        consecutiveSuccesses: 1,
        failures: 0,
      },
      fixture: true,
    };
  }

  return {
    contract: {
      name: metricsContractName,
      version: metricsContractVersion,
    },
    canary: {
      attempts: 3,
      successes: 3,
      consecutiveSuccesses: 3,
      failures: 0,
    },
    fixture: true,
  };
}

const server = http.createServer((req, res) => {
  if (req.url === "/api/healthz") {
    res.writeHead(healthStatus, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        ok: healthOk,
        fixture: true,
      }),
    );
    return;
  }

  if (req.url === "/api/metrics/promotion") {
    if (metricsMode === "invalid") {
      res.writeHead(200, { "content-type": "text/plain" });
      res.end("invalid-metrics-payload");
      return;
    }

    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(buildMetricsPayload()));
    return;
  }

  if (req.url !== "/api/readyz") {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not found");
    return;
  }

  if (invalidPayload || mode === "invalid") {
    res.writeHead(status, { "content-type": "text/plain" });
    res.end("invalid-readiness-payload");
    return;
  }

  if (mode === "degraded") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        ok: true,
        blockers: [],
        contract: {
          name: contractName,
          version: contractVersion,
        },
        degraded: true,
        reasons: ["upstream_degraded"],
        fixture: true,
      }),
    );
    return;
  }

  if (mode === "failclosed") {
    res.writeHead(503, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        ok: false,
        blockers: ["fixture-unready"],
        contract: {
          name: contractName,
          version: contractVersion,
        },
        fixture: true,
      }),
    );
    return;
  }

  if (mode === "blocked") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        ok: true,
        blockers: ["policy-blocked"],
        contract: {
          name: contractName,
          version: contractVersion,
        },
        fixture: true,
      }),
    );
    return;
  }

  res.writeHead(status, { "content-type": "application/json" });
  res.end(
    JSON.stringify({
      ok,
      blockers: ok ? [] : ["fixture-unready"],
      contract: {
        name: contractName,
        version: contractVersion,
      },
      fixture: true,
    }),
  );
});

server.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(
    `[readyz-fixture] listening http://${host}:${port} mode=${mode} status=${status} ok=${ok} health=${healthOk}/${healthStatus} invalidPayload=${invalidPayload} contract=${contractName}@${contractVersion} metricsMode=${metricsMode} metricsContract=${metricsContractName}@${metricsContractVersion}`,
  );
});

function shutdown() {
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

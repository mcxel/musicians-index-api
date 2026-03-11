const http = require("http");

const host = process.env.READYZ_FIXTURE_HOST || "127.0.0.1";
const port = Number(process.env.READYZ_FIXTURE_PORT || "4011");
const status = Number(process.env.READYZ_FIXTURE_STATUS || "200");
const ok = (process.env.READYZ_FIXTURE_OK || "true").toLowerCase() === "true";
const invalidPayload = (process.env.READYZ_FIXTURE_INVALID_PAYLOAD || "false").toLowerCase() === "true";

const server = http.createServer((req, res) => {
  if (req.url !== "/api/readyz") {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not found");
    return;
  }

  if (invalidPayload) {
    res.writeHead(status, { "content-type": "text/plain" });
    res.end("invalid-readiness-payload");
    return;
  }

  res.writeHead(status, { "content-type": "application/json" });
  res.end(
    JSON.stringify({
      ok,
      blockers: ok ? [] : ["fixture-unready"],
      fixture: true,
    }),
  );
});

server.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(
    `[readyz-fixture] listening http://${host}:${port}/api/readyz status=${status} ok=${ok} invalidPayload=${invalidPayload}`,
  );
});

function shutdown() {
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

import http from "http";
import WebSocket from "ws";

function get(path) {
  return new Promise((resolve, reject) => {
    http
      .get("http://127.0.0.1:9222" + path, (r) => {
        let d = "";
        r.on("data", (c) => (d += c));
        r.on("end", () => resolve(d));
      })
      .on("error", reject);
  });
}

async function check(url, waitMs = 18000) {
  const tabs = JSON.parse(await get("/json"));
  const page = tabs.find((t) => t.type === "page") || tabs[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const logs = [];

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const i = ++id;
      pending.set(i, { resolve, reject });
      ws.send(JSON.stringify({ id: i, method, params }));
      setTimeout(() => reject(new Error("timeout " + method)), 90000);
    });

  await new Promise((r) => ws.on("open", r));
  ws.on("message", (raw) => {
    const msg = JSON.parse(String(raw));
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(JSON.stringify(msg.error)));
      else p.resolve(msg.result);
    }
    if (msg.method === "Runtime.consoleAPICalled") {
      const text = (msg.params.args || [])
        .map((a) => a.value ?? a.description ?? JSON.stringify(a))
        .join(" ");
      logs.push({ type: msg.params.type, text });
    }
    if (msg.method === "Runtime.exceptionThrown") {
      const d = msg.params.exceptionDetails;
      logs.push({
        type: "exception",
        text:
          (d.exception && (d.exception.description || d.exception.value)) ||
          d.text ||
          JSON.stringify(d),
        url: d.url,
        line: d.lineNumber,
      });
    }
  });

  await send("Runtime.enable");
  await send("Page.enable");
  await send("Network.enable");
  await send("Page.navigate", { url });
  await new Promise((r) => setTimeout(r, waitMs));

  const evalResult = await send("Runtime.evaluate", {
    expression: `(() => {
      const overlay = document.querySelector('nextjs-portal, [data-nextjs-dialog]');
      const text = (document.body && document.body.innerText) ? document.body.innerText.slice(0, 3000) : '';
      const headings = [...document.querySelectorAll('h1,h2')].map(n => n.textContent).slice(0, 10);
      return {
        title: document.title,
        href: location.href,
        hasOverlay: !!overlay,
        headings,
        snippet: text,
      };
    })()`,
    returnByValue: true,
  });

  ws.close();
  return {
    url,
    page: evalResult.result.value,
    exceptions: logs.filter((l) => l.type === "exception" || /error/i.test(l.type)),
    recentLogs: logs.slice(-30),
  };
}

const urls = process.argv.slice(2);
const targets =
  urls.length > 0
    ? urls
    : [
        "http://localhost:3000/rooms/fan-lobby",
        "http://localhost:3000/admin/overseer",
        "http://localhost:3000/hub/fan",
      ];

for (const u of targets) {
  try {
    const result = await check(u);
    console.log("====", u, "====");
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.log("====", u, "FAIL ====");
    console.error(String(e && e.stack ? e.stack : e));
  }
}

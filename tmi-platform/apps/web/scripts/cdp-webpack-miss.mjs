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
    if (/WEBPACK_MISS|call|StageLoader|Cannot read|error/i.test(text)) {
      logs.push({ type: msg.params.type, text: text.slice(0, 2000) });
    }
  }
  if (msg.method === "Runtime.exceptionThrown") {
    const d = msg.params.exceptionDetails;
    logs.push({
      type: "exception",
      text: String(
        (d.exception && (d.exception.description || d.exception.value)) ||
          d.text ||
          ""
      ).slice(0, 1500),
    });
  }
});

await send("Runtime.enable");
await send("Page.enable");

// Install webpack require interceptor before navigation
await send("Page.addScriptToEvaluateOnNewDocument", {
  source: `
(() => {
  const install = () => {
    const w = self.webpackChunk_N_E;
    // Hook once webpack runtime exists
    const tryHook = () => {
      try {
        const req = self.__webpack_require__ || (typeof __webpack_require__ !== 'undefined' ? __webpack_require__ : null);
      } catch (_) {}
      const g = self;
      if (!g.webpackChunk_N_E) return false;
      // Patch module factories when webpack runtime assigns __webpack_require__
      const desc = Object.getOwnPropertyDescriptor(g, '__webpack_require__');
      if (g.__webpack_require__ && !g.__webpack_require__.__tmiHooked) {
        const orig = g.__webpack_require__;
        const wrapped = function(moduleId) {
          try {
            return orig(moduleId);
          } catch (e) {
            const m = orig.m && orig.m[moduleId];
            console.error('WEBPACK_MISS', String(moduleId), 'factory=', typeof m, 'err=', e && e.message);
            // Try to find nearby module ids with paths
            try {
              const keys = Object.keys(orig.m || {}).slice(0, 5);
              console.error('WEBPACK_SAMPLE_KEYS', keys.join(','));
              const named = [];
              for (const k of Object.keys(orig.c || {})) {
                const mod = orig.c[k];
                if (mod && mod.exports) named.push(k);
              }
            } catch(_){}
            throw e;
          }
        };
        wrapped.__tmiHooked = true;
        for (const k of Object.keys(orig)) wrapped[k] = orig[k];
        Object.setPrototypeOf(wrapped, Object.getPrototypeOf(orig));
        g.__webpack_require__ = wrapped;
        // also keep sync of .m .c
        Object.defineProperty(wrapped, 'm', { get: () => orig.m, set: (v) => { orig.m = v; } });
        Object.defineProperty(wrapped, 'c', { get: () => orig.c, set: (v) => { orig.c = v; } });
        console.info('WEBPACK_HOOK_INSTALLED');
        return true;
      }
      return false;
    };
    let n = 0;
    const t = setInterval(() => {
      n++;
      if (tryHook() || n > 200) clearInterval(t);
    }, 20);
  };
  install();
})();
`,
});

await send("Page.navigate", { url: "http://localhost:3000/rooms/fan-lobby" });
await new Promise((r) => setTimeout(r, 22000));

const miss = await send("Runtime.evaluate", {
  expression: `(() => {
    const req = self.__webpack_require__;
    if (!req) return { hooked: false };
    // Find undefined factories
    const missing = [];
    const modules = req.m || {};
    for (const id of Object.keys(modules)) {
      if (typeof modules[id] !== 'function') missing.push({ id, type: typeof modules[id] });
    }
    return {
      hooked: !!req.__tmiHooked,
      moduleCount: Object.keys(modules).length,
      missingSample: missing.slice(0, 30),
      missingCount: missing.length,
    };
  })()`,
  returnByValue: true,
});

console.log(JSON.stringify({ miss: miss.result.value, logs: logs.slice(-40) }, null, 2));
ws.close();

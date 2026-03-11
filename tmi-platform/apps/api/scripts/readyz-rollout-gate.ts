const READYZ_URL = process.env.READYZ_GATE_URL || "http://localhost:4000/api/readyz";
const MAX_ATTEMPTS = Number(process.env.READYZ_GATE_MAX_ATTEMPTS || 5);
const RETRY_DELAY_MS = Number(process.env.READYZ_GATE_RETRY_DELAY_MS || 1000);
const REQUEST_TIMEOUT_MS = Number(process.env.READYZ_GATE_TIMEOUT_MS || 1500);

type ReadyzPayload = {
  ok?: boolean;
  blockers?: string[];
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkOnce(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    let payload: ReadyzPayload | undefined;
    try {
      payload = (await response.json()) as ReadyzPayload;
    } catch {
      payload = undefined;
    }

    const ok = response.status === 200 && payload?.ok === true;
    return {
      ok,
      status: response.status,
      blockers: payload?.blockers || [],
      reason: ok ? undefined : "non-200 or invalid readiness payload",
    };
  } catch (error) {
    clearTimeout(timeout);
    return {
      ok: false,
      status: 0,
      blockers: [] as string[],
      reason: error instanceof Error ? error.message : "readyz request failed",
    };
  }
}

async function run() {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const result = await checkOnce(READYZ_URL);
    if (result.ok) {
      // eslint-disable-next-line no-console
      console.log(`[readyz-gate] PASS attempt=${attempt} url=${READYZ_URL}`);
      return;
    }

    // eslint-disable-next-line no-console
    console.error(
      `[readyz-gate] FAIL attempt=${attempt}/${MAX_ATTEMPTS} status=${result.status} reason=${result.reason} blockers=${result.blockers.join(",")}`,
    );

    if (attempt < MAX_ATTEMPTS) {
      await sleep(RETRY_DELAY_MS);
    }
  }

  process.exitCode = 1;
}

run();

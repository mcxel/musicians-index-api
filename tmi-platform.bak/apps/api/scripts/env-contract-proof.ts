import { getBootEnvValidationErrors, validateBootEnvOrThrow } from "../src/modules/health/readiness";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function withEnv(overrides: Record<string, string | undefined>, fn: () => void) {
  const backup: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(overrides)) {
    backup[key] = process.env[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    fn();
  } finally {
    for (const [key, value] of Object.entries(backup)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

function expectThrow(fn: () => void, contains: string) {
  let threw = false;
  try {
    fn();
  } catch (error) {
    threw = true;
    const message = error instanceof Error ? error.message : String(error);
    assert(
      message.includes(contains),
      `expected thrown message to contain '${contains}', got '${message}'`,
    );
  }

  assert(threw, `expected function to throw and include '${contains}'`);
}

async function run() {
  withEnv(
    {
      DATABASE_URL: "postgresql://user:pass@localhost:5432/app",
      NODE_ENV: "development",
      PORT: "4000",
      CORS_ORIGINS: "http://localhost:3000,http://localhost:3001",
      REDIS_URL: undefined,
      READYZ_OPTIONAL_UPSTREAMS: undefined,
      READYZ_OPTIONAL_UPSTREAM_TIMEOUT_OVERRIDES: undefined,
    },
    () => {
      const errors = getBootEnvValidationErrors();
      assert(errors.length === 0, `expected valid env to pass, got: ${errors.join(" | ")}`);
      validateBootEnvOrThrow();
    },
  );

  withEnv(
    {
      DATABASE_URL: undefined,
    },
    () => {
      expectThrow(validateBootEnvOrThrow, "DATABASE_URL is required");
    },
  );

  withEnv(
    {
      DATABASE_URL: "invalid-db-url",
    },
    () => {
      expectThrow(validateBootEnvOrThrow, "DATABASE_URL must use a supported PostgreSQL/Prisma URL scheme");
    },
  );

  withEnv(
    {
      DATABASE_URL: "postgresql://user:pass@localhost:5432/app",
      PORT: "99999",
    },
    () => {
      expectThrow(validateBootEnvOrThrow, "PORT must be an integer between 1 and 65535");
    },
  );

  withEnv(
    {
      DATABASE_URL: "postgresql://user:pass@localhost:5432/app",
      NODE_ENV: "dev-ish",
    },
    () => {
      expectThrow(validateBootEnvOrThrow, "NODE_ENV must be one of");
    },
  );

  withEnv(
    {
      DATABASE_URL: "postgresql://user:pass@localhost:5432/app",
      CORS_ORIGINS: "not-a-url",
      PORT: undefined,
      NODE_ENV: undefined,
    },
    () => {
      expectThrow(validateBootEnvOrThrow, "CORS_ORIGINS contains invalid origin URL");
    },
  );

  withEnv(
    {
      DATABASE_URL: "postgresql://user:pass@localhost:5432/app",
      REDIS_URL: undefined,
      READYZ_OPTIONAL_UPSTREAMS: undefined,
      READYZ_OPTIONAL_UPSTREAM_TIMEOUT_OVERRIDES: undefined,
      PORT: undefined,
      NODE_ENV: undefined,
      CORS_ORIGINS: undefined,
    },
    () => {
      const errors = getBootEnvValidationErrors();
      assert(
        errors.length === 0,
        `expected optional env absence to pass, got: ${errors.join(" | ")}`,
      );
      validateBootEnvOrThrow();
    },
  );

  // eslint-disable-next-line no-console
  console.log("env contract proof passed");
}

void run();

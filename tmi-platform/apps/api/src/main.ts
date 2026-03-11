import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import type { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { validateBootEnvOrThrow } from "./modules/health/readiness";

async function bootstrap() {
  validateBootEnvOrThrow();
  const app = await NestFactory.create(AppModule);
  const isProd = process.env.NODE_ENV === "production";

  const allowedOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  if (allowedOrigins.length === 0) {
    allowedOrigins.push("http://localhost:3000", "http://localhost:3001");
  }

  app.setGlobalPrefix("api");
  app.use(helmet());
  app.use(cookieParser());
  app.use((req: Request, res: Response, next: NextFunction) => {
    const method = req.method.toUpperCase();
    const isMutation = method === "POST" || method === "PATCH" || method === "PUT" || method === "DELETE";

    if (!isMutation) {
      next();
      return;
    }

    const csrfFromHeader = req.header("x-csrf-token");
    const csrfFromCookie = req.cookies?.phase11_csrf as string | undefined;
    if (!csrfFromHeader || !csrfFromCookie || csrfFromHeader !== csrfFromCookie) {
      res.status(403).json({ message: "CSRF token validation failed", statusCode: 403 });
      return;
    }

    next();
  });
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token"],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: isProd,
    }),
  );

  const port = Number(process.env.PORT || 4000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`[api] listening on http://localhost:${port}/api`);
}

bootstrap();

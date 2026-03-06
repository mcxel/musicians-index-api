// apps/web must never import Prisma. If web needs DB-backed data, call
// apps/api endpoints instead. This file intentionally throws so accidental
// imports cause an immediate, loud failure during development and CI.
throw new Error("FORBIDDEN: apps/web cannot use Prisma. Use apps/api via HTTP instead.");
export {};

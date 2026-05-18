import { PrismaClient } from "@prisma/client";

/** Bump when the Prisma schema changes so dev HMR does not keep a stale client (missing new columns). */
const PRISMA_CLIENT_SCHEMA_TOKEN = "20260518-application-interviews";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSchemaToken?: string;
};

if (globalForPrisma.prismaSchemaToken !== PRISMA_CLIENT_SCHEMA_TOKEN) {
  void globalForPrisma.prisma?.$disconnect();
  globalForPrisma.prisma = undefined;
  globalForPrisma.prismaSchemaToken = PRISMA_CLIENT_SCHEMA_TOKEN;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { PrismaClient } from "@prisma/client";
export { ensureApplicationRelevanceScore, type ApplicationRelevanceResult } from "./application-relevance";
export { recordApplicationStatusEvent, type RecordApplicationStatusEventInput } from "./application-status-events";

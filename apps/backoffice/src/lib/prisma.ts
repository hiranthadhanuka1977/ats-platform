/** Load root DATABASE_URL before Prisma client initializes (see load-root-env.ts). */
import "@/lib/load-root-env";
export { prisma, PrismaClient } from "@ats-platform/db";

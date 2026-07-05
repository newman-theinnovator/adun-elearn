import { PrismaClient } from "@prisma/client";
import { getServerEnv } from "./env";

getServerEnv(); // fail fast if DATABASE_URL/DIRECT_URL etc. are missing

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

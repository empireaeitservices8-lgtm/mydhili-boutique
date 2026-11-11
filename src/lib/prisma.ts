import type { PrismaClient as PrismaClientType } from "@prisma/client";
import { PrismaClient as DefaultPrismaClient } from "@prisma/client";
import { createRequire } from "module";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientType | undefined;
};

function createPrismaClient(): PrismaClientType {
  const options = {
    log: (process.env.NODE_ENV === "development"
      ? ["warn", "error"]
      : ["error"]) as ("warn" | "error")[],
  };

  try {
    return new DefaultPrismaClient(options);
  } catch (err) {
    // If the dev server cached @prisma/client before `prisma generate` ran,
    // bypass the stale @prisma/client/default.js cache and load the generated client directly.
    const req = createRequire(import.meta.url);
    const { PrismaClient: GeneratedPrismaClient } = req(
      ".prisma/client/index.js"
    ) as { PrismaClient: typeof DefaultPrismaClient };
    return new GeneratedPrismaClient(options);
  }
}

function getPrismaClient(): PrismaClientType {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma: PrismaClientType = new Proxy({} as PrismaClientType, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default prisma;

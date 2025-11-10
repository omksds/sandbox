import { PrismaClient } from "@prisma/client";

// PrismaClientのシングルトンインスタンスを作成
// 開発環境では、HMRによる複数インスタンス作成を防ぐためglobalに保存
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: (() => {
      const enableQueryLog =
        process.env.PRISMA_QUERY_LOG === "true" ||
        process.env.NEXT_PUBLIC_ENABLE_PRISMA_QUERY_LOG === "true";
      if (enableQueryLog) return ["query", "error", "warn"] as const;
      return ["error", "warn"] as const;
    })(),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}


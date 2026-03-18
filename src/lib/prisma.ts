import { Prisma, PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

type ExtendedPrisma = ReturnType<typeof createExtendedPrisma>;
const globalForPrisma = globalThis as unknown as {
  prisma?: ExtendedPrisma;
};

function norm(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  return url;
}

function createAdapter() {
  return new PrismaPg({ connectionString: getDatabaseUrl() });
}

function createExtendedPrisma(client: PrismaClient) {
  return client.$extends({
    query: {
      product: {
        async create({ args, query }) {
          if (args.data && typeof args.data === "object" && !Array.isArray(args.data)) {
            const data = args.data as Prisma.ProductCreateInput;
            data.nameNorm = norm(data.name as string);
            if (data.sku !== undefined) data.skuNorm = data.sku ? norm(String(data.sku)) : null;
            if (data.barcode !== undefined) data.barcodeNorm = data.barcode ? norm(String(data.barcode)) : null;
          }
          return query(args);
        },
        async update({ args, query }) {
          if (args.data && typeof args.data === "object" && !Array.isArray(args.data)) {
            const data = args.data as Prisma.ProductUpdateInput;
            if (data.name !== undefined) data.nameNorm = norm(String(data.name));
            if (data.sku !== undefined) data.skuNorm = data.sku ? norm(String(data.sku)) : null;
            if (data.barcode !== undefined) data.barcodeNorm = data.barcode ? norm(String(data.barcode)) : null;
          }
          return query(args);
        },
        async upsert({ args, query }) {
          if (args.create && typeof args.create === "object" && !Array.isArray(args.create)) {
            const create = args.create as Prisma.ProductCreateInput;
            create.nameNorm = norm(create.name as string);
            create.skuNorm = create.sku ? norm(String(create.sku)) : null;
            create.barcodeNorm = create.barcode ? norm(String(create.barcode)) : null;
          }
          if (args.update && typeof args.update === "object" && !Array.isArray(args.update)) {
            const update = args.update as Prisma.ProductUpdateInput;
            if (update.name !== undefined) update.nameNorm = norm(String(update.name));
            if (update.sku !== undefined) update.skuNorm = update.sku ? norm(String(update.sku)) : null;
            if (update.barcode !== undefined) update.barcodeNorm = update.barcode ? norm(String(update.barcode)) : null;
          }
          return query(args);
        },
      },
    },
  });
}

const basePrisma = new PrismaClient({
  adapter: createAdapter(),
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

export const prisma: ExtendedPrisma =
  globalForPrisma.prisma ?? createExtendedPrisma(basePrisma);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

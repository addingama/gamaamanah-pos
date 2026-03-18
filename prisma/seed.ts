import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma";

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  return url;
}

function createAdapter() {
  const databaseUrl = new URL(getDatabaseUrl());

  if (databaseUrl.protocol !== "mysql:") {
    throw new Error("DATABASE_URL harus memakai skema mysql://");
  }

  const database = databaseUrl.pathname.replace(/^\//, "");
  if (!database) {
    throw new Error("Nama database pada DATABASE_URL wajib diisi");
  }

  return new PrismaMariaDb({
    host: databaseUrl.hostname,
    port: databaseUrl.port ? Number(databaseUrl.port) : 3306,
    user: decodeURIComponent(databaseUrl.username),
    password: decodeURIComponent(databaseUrl.password),
    database,
    ssl:
      databaseUrl.searchParams.get("sslaccept") === "strict"
        ? {
            rejectUnauthorized: true,
          }
        : undefined,
  });
}

const prisma = new PrismaClient({
  adapter: createAdapter(),
});

async function ensureCategory(name: string, slug: string) {
  const existing = await prisma.category.findFirst({
    where: { name: { equals: name } },
  });
  if (existing) return existing;
  return prisma.category.create({
    data: { name, slug },
  });
}

async function main() {
  const beras = await ensureCategory("Beras", "beras");
  const gula = await ensureCategory("Gula", "gula");
  const minyak = await ensureCategory("Minyak", "minyak");

  const items = [
    {
      sku: "BR-001",
      barcode: "899000000001",
      name: "Beras Premium 5kg",
      categoryId: beras.id,
      unit: "sak",
      price: 78000,
      buyPrice: 72000,
      stock: "IN_STOCK" as const,
      isActive: true,
    },
    {
      sku: "GM-001",
      barcode: "899000000002",
      name: "Gula Pasir 1kg",
      categoryId: gula.id,
      unit: "kg",
      price: 17000,
      buyPrice: 15500,
      stock: "LOW" as const,
      isActive: true,
    },
    {
      sku: "MY-001",
      barcode: "899000000003",
      name: "Minyak Goreng 1L",
      categoryId: minyak.id,
      unit: "botol",
      price: 18500,
      buyPrice: 19000,
      stock: "OUT" as const,
      isActive: true,
    },
  ];

  for (const item of items) {
    const skuNorm = item.sku.toLowerCase();
    const barcodeNorm = item.barcode.toLowerCase();
    const nameNorm = item.name.toLowerCase();

    await prisma.product.upsert({
      where: { sku: item.sku },
      create: {
        ...item,
        skuNorm,
        barcodeNorm,
        nameNorm,
      },
      update: {
        ...item,
        skuNorm,
        barcodeNorm,
        nameNorm,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

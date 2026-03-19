import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { publicProductsResponseSchema } from "@/lib/api/public-products";

const QuerySchema = z.object({
  q: z.string().trim().max(80).optional().default(""),
  limit: z.coerce.number().int().min(1).max(30).optional().default(20),
});

function normalize(q: string) {
  return q.trim().toLowerCase();
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    q: url.searchParams.get("q") ?? "",
    limit: url.searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const qRaw = parsed.data.q.trim();
  const q = normalize(qRaw);
  const limit = parsed.data.limit;

  if (q.length === 0) {
    return NextResponse.json({ items: [] });
  }

  try {
    const rows = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { nameNorm: { contains: q } },
          { skuNorm: { contains: q } },
          { barcodeNorm: { contains: q } },
          { category: { is: { name: { contains: qRaw, mode: "insensitive" } } } },
        ],
      },
      orderBy: [{ nameNorm: "asc" }],
      take: limit,
      select: {
        id: true,
        sku: true,
        barcode: true,
        name: true,
        unit: true,
        price: true,
        stock: true,
        updatedAt: true,
        category: { select: { name: true } },
      },
    });

    const items = rows.map((r) => ({
      id: r.id,
      sku: r.sku,
      barcode: r.barcode,
      name: r.name,
      category: r.category?.name ?? null,
      unit: r.unit,
      price: r.price,
      stock: r.stock,
      updatedAt: r.updatedAt.toISOString(),
    }));

    const body = publicProductsResponseSchema.safeParse({ items });
    if (!body.success) {
      return NextResponse.json({ error: "Gagal menyiapkan data." }, { status: 500 });
    }
    return NextResponse.json(body.data);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data dari basis data." }, { status: 500 });
  }
}

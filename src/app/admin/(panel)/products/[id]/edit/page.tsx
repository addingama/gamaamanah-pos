import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../../ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!p) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/products/${p.id}`} className="text-sm font-medium text-zinc-600 hover:underline">
          ← Detail barang
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Ubah barang</h1>
      </div>
      <ProductForm
        mode="edit"
        categories={categories}
        defaultValues={{
          id: p.id,
          name: p.name,
          sku: p.sku ?? "",
          barcode: p.barcode ?? "",
          unit: p.unit,
          price: p.price,
          buyPrice: p.buyPrice,
          stock: p.stock,
          isActive: p.isActive,
          categoryId: p.categoryId ?? "",
        }}
      />
    </div>
  );
}

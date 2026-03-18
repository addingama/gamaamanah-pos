import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm font-medium text-zinc-600 hover:underline">
          ← Daftar barang
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Barang baru</h1>
      </div>
      <ProductForm mode="create" categories={categories} />
    </div>
  );
}

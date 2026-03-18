import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatTanggalId } from "@/lib/format";
import { deleteProductAction } from "../actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { QuickStockTrigger } from "@/components/admin/QuickStockTrigger";

const stockLabels: Record<string, string> = {
  IN_STOCK: "Tersedia",
  LOW: "Menipis",
  OUT: "Habis",
};

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!p) notFound();

  const warnBelowCost = p.price < p.buyPrice;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/admin/products" className="text-sm font-medium text-zinc-600 hover:underline">
            ← Daftar barang
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{p.name}</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {p.category?.name ?? "Tanpa kategori"} · {p.sku ?? "Tanpa kode"} · {p.barcode ?? "Tanpa barcode"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <QuickStockTrigger product={{ id: p.id, name: p.name, stock: p.stock }} />
          <Link
            href={`/admin/products/${p.id}/edit`}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
          >
            Ubah
          </Link>
          <form action={deleteProductAction}>
            <input type="hidden" name="id" value={p.id} />
            <ConfirmDeleteButton className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-800 hover:bg-rose-100" />
          </form>
        </div>
      </div>

      {warnBelowCost ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Perhatian: harga jual di bawah harga beli.
        </div>
      ) : null}

      <div className="grid gap-4 rounded-2xl border bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-6">
        <div>
          <p className="text-xs font-medium text-zinc-500">Harga jual</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">{formatRupiah(p.price)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-500">Harga beli</p>
          <p className="mt-1 text-lg font-semibold text-zinc-800">{formatRupiah(p.buyPrice)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-500">Satuan</p>
          <p className="mt-1 text-sm text-zinc-800">{p.unit}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-500">Status stok</p>
          <p className="mt-1 text-sm text-zinc-800">{stockLabels[p.stock] ?? p.stock}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-500">Aktif (cek harga)</p>
          <p className="mt-1 text-sm text-zinc-800">{p.isActive ? "Ya" : "Tidak"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-500">Terakhir diubah</p>
          <p className="mt-1 text-sm text-zinc-800">
            {formatTanggalId(p.updatedAt, { dateStyle: "long", timeStyle: "short" })}
          </p>
        </div>
      </div>
    </div>
  );
}

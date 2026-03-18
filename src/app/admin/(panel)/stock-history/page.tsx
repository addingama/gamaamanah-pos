import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatTanggalId } from "@/lib/format";

type SearchParams = Promise<{ productId?: string }>;

const stockLabels: Record<string, string> = {
  IN_STOCK: "Tersedia",
  LOW: "Menipis",
  OUT: "Habis",
};

const changeTypeLabels: Record<string, string> = {
  INITIAL: "Awal",
  RESTOCK: "Restock",
  SALE: "Penjualan",
  ADJUST: "Koreksi",
  DAMAGE: "Rusak/Hilang",
  RETURN: "Retur",
  OTHER: "Lainnya",
};

export default async function StockHistoryPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const productId = sp.productId?.trim() || undefined;

  const [histories, products] = await Promise.all([
    prisma.stockHistory.findMany({
      where: productId ? { productId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
      },
    }),
    prisma.product.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, sku: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Riwayat Stok</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Setiap perubahan status stok tercatat dengan jenis perubahan.
        </p>
      </div>

      <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <div className="min-w-0 flex-1">
          <label htmlFor="productId" className="text-xs font-medium text-zinc-500">
            Filter barang
          </label>
          <select
            id="productId"
            name="productId"
            defaultValue={productId ?? ""}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm sm:max-w-xs"
          >
            <option value="">Semua barang</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.sku ? `(${p.sku})` : ""}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white"
        >
          Terapkan
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b bg-zinc-50 text-xs font-medium text-zinc-500">
              <tr>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Barang</th>
                <th className="px-4 py-3">Sebelum</th>
                <th className="px-4 py-3">Sesudah</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {histories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                    {productId ? "Tidak ada riwayat untuk barang ini." : "Belum ada riwayat stok."}
                  </td>
                </tr>
              ) : (
                histories.map((h) => (
                  <tr key={h.id} className="hover:bg-zinc-50/80">
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                      {formatTanggalId(h.createdAt, { dateStyle: "medium", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/products/${h.product.id}`}
                        className="font-medium text-zinc-900 hover:underline"
                      >
                        {h.product.name}
                      </Link>
                      {h.product.sku ? (
                        <span className="ml-1 text-zinc-500">({h.product.sku})</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{stockLabels[h.previousStock] ?? h.previousStock}</td>
                    <td className="px-4 py-3 font-medium">{stockLabels[h.newStock] ?? h.newStock}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
                        {changeTypeLabels[h.changeType] ?? h.changeType}
                      </span>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-zinc-600">
                      {h.note ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {histories.length >= 200 ? (
        <p className="text-center text-xs text-zinc-500">
          Menampilkan 200 riwayat terbaru.
        </p>
      ) : null}
    </div>
  );
}

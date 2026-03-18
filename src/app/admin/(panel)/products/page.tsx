import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";
import type { Prisma } from "@/generated/prisma";
import { QuickStockTrigger } from "@/components/admin/QuickStockTrigger";

type SearchParams = Promise<{
  q?: string;
  categoryId?: string;
  sort?: string;
  order?: string;
  active?: string;
  stock?: string;
}>;

const stockLabels: Record<string, string> = {
  IN_STOCK: "Tersedia",
  LOW: "Menipis",
  OUT: "Habis",
};

export default async function AdminProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const categoryId = sp.categoryId?.trim() || undefined;
  const sort = sp.sort === "price" || sp.sort === "updated" ? sp.sort : "name";
  const order = sp.order === "desc" ? "desc" : "asc";
  const active = sp.active === "false" ? "false" : sp.active === "true" ? "true" : "all";
  const stockFilter =
    sp.stock === "IN_STOCK" || sp.stock === "LOW" || sp.stock === "OUT" ? sp.stock : undefined;

  const where: Prisma.ProductWhereInput = {};
  if (active === "true") where.isActive = true;
  if (active === "false") where.isActive = false;
  if (categoryId) where.categoryId = categoryId;
  if (stockFilter) where.stock = stockFilter;
  if (q.length > 0) {
    where.OR = [
      { nameNorm: { contains: q } },
      { skuNorm: { contains: q } },
      { barcodeNorm: { contains: q } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price"
      ? { price: order }
      : sort === "updated"
        ? { updatedAt: order }
        : { nameNorm: order };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take: 100,
      include: { category: { select: { id: true, name: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const buildHref = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = {
      q: sp.q,
      categoryId: sp.categoryId,
      sort: sp.sort,
      order: sp.order,
      active: sp.active,
      stock: sp.stock,
      ...patch,
    };
    if (merged.q) p.set("q", merged.q);
    if (merged.categoryId) p.set("categoryId", merged.categoryId);
    if (merged.sort) p.set("sort", merged.sort);
    if (merged.order) p.set("order", merged.order);
    if (merged.active && merged.active !== "all") p.set("active", merged.active);
    if (merged.stock) p.set("stock", merged.stock);
    const s = p.toString();
    return s ? `/admin/products?${s}` : "/admin/products";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Barang</h1>
          <p className="mt-1 text-sm text-zinc-600">Maks. 100 baris per halaman.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white"
        >
          + Barang baru
        </Link>
      </div>

      <form method="get" className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-zinc-500">Cari</label>
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Nama / kode / barcode"
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Kategori</label>
          <select
            name="categoryId"
            defaultValue={categoryId ?? ""}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          >
            <option value="">Semua</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Status jual</label>
          <select name="active" defaultValue={active} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
            <option value="all">Semua</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Stok</label>
          <select name="stock" defaultValue={stockFilter ?? ""} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
            <option value="">Semua</option>
            <option value="IN_STOCK">Tersedia</option>
            <option value="LOW">Menipis</option>
            <option value="OUT">Habis</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Urutkan</label>
          <select name="sort" defaultValue={sort} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
            <option value="name">Nama</option>
            <option value="price">Harga jual</option>
            <option value="updated">Terakhir ubah</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Arah</label>
          <select name="order" defaultValue={order} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
            <option value="asc">Naik</option>
            <option value="desc">Turun</option>
          </select>
        </div>
        <div className="flex items-end sm:col-span-2 lg:col-span-3 xl:col-span-6">
          <button type="submit" className="w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white sm:w-auto">
            Terapkan
          </button>
        </div>
      </form>

      <div className="hidden rounded-2xl border bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-zinc-50 text-xs font-medium text-zinc-500">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Kode</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3 text-right">Harga jual</th>
              <th className="px-4 py-3">Stok</th>
              <th className="px-4 py-3">Aktif</th>
              <th className="px-4 py-3 w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  Tidak ada data.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50/80">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="font-medium text-zinc-900 hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{p.sku ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-600">{p.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatRupiah(p.price)}</td>
                  <td className="px-4 py-3">{stockLabels[p.stock] ?? p.stock}</td>
                  <td className="px-4 py-3">{p.isActive ? "Ya" : "Tidak"}</td>
                  <td className="px-4 py-3">
                    <QuickStockTrigger product={{ id: p.id, name: p.name, stock: p.stock }} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {products.length === 0 ? (
          <li className="rounded-2xl border bg-white p-6 text-center text-sm text-zinc-500">Tidak ada data.</li>
        ) : (
          products.map((p) => (
            <li key={p.id} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link href={`/admin/products/${p.id}`} className="font-semibold text-zinc-900 hover:underline">
                    {p.name}
                  </Link>
                  <p className="mt-1 text-xs text-zinc-500">
                    {p.sku ?? "Tanpa kode"} · {p.category?.name ?? "Tanpa kategori"}
                  </p>
                  <p className="mt-2 text-lg font-bold">{formatRupiah(p.price)}</p>
                  <p className="mt-1 text-xs text-zinc-600">
                    {stockLabels[p.stock]} · {p.isActive ? "Aktif" : "Nonaktif"}
                  </p>
                </div>
                <QuickStockTrigger product={{ id: p.id, name: p.name, stock: p.stock }} />
              </div>
            </li>
          ))
        )}
      </ul>

      <p className="text-center text-xs text-zinc-500">
        <Link href={buildHref({ sort: "updated", order: "desc" })} className="hover:underline">
          Urutkan terbaru diubah
        </Link>
      </p>
    </div>
  );
}

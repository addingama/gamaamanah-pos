import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [productCount, activeCount, categoryCount, lowStock, recent] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.category.count(),
    prisma.product.count({ where: { stock: "LOW" } }),
    prisma.product.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        price: true,
        updatedAt: true,
        category: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ringkasan</h1>
        <p className="mt-1 text-sm text-zinc-600">Gambaran singkat data toko.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total barang" value={String(productCount)} href="/admin/products" />
        <StatCard label="Aktif (publik)" value={String(activeCount)} href="/admin/products?active=true" />
        <StatCard label="Kategori" value={String(categoryCount)} href="/admin/categories" />
        <StatCard label="Stok menipis" value={String(lowStock)} href="/admin/products?stock=LOW" />
      </div>

      <section className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Terakhir diubah</h2>
          <Link href="/admin/products" className="text-sm font-medium text-zinc-700 hover:underline">
            Lihat semua
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-zinc-100">
          {recent.length === 0 ? (
            <li className="py-6 text-center text-sm text-zinc-500">Belum ada barang.</li>
          ) : (
            recent.map((p) => (
              <li key={p.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Link href={`/admin/products/${p.id}`} className="font-medium text-zinc-900 hover:underline">
                    {p.name}
                  </Link>
                  <p className="text-xs text-zinc-500">
                    {p.category?.name ?? "Tanpa kategori"}
                  </p>
                </div>
                <span className="text-sm font-semibold text-zinc-800">{formatRupiah(p.price)}</span>
              </li>
            ))
          )}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white"
        >
          + Barang baru
        </Link>
        <Link
          href="/admin/categories"
          className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800"
        >
          Kelola kategori
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300"
    >
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900">{value}</p>
    </Link>
  );
}

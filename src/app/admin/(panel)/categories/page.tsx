import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CategoryCreateForm } from "./CategoryCreateForm";
import { CategoryRow } from "./CategoryRow";

type SearchParams = Promise<{ q?: string; sort?: string }>;

export default async function AdminCategoriesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const sort = sp.sort === "name_desc" ? "name_desc" : "name_asc";

  const all = await prisma.category.findMany({
    orderBy: { name: sort === "name_desc" ? "desc" : "asc" },
  });
  const categories = q
    ? all.filter((c) => c.name.toLowerCase().includes(q))
    : all;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kategori</h1>
          <p className="mt-1 text-sm text-zinc-600">Kelola kategori barang.</p>
        </div>
        <Link
          href="/admin/products"
          className="text-sm font-medium text-zinc-700 hover:underline"
        >
          ← Kembali ke barang
        </Link>
      </div>

      <CategoryCreateForm />

      <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
        <form method="get" className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="q" className="text-xs font-medium text-zinc-500">
              Cari
            </label>
            <input
              id="q"
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="Nama kategori..."
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="sort" className="text-xs font-medium text-zinc-500">
              Urutkan
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={sort === "name_desc" ? "name_desc" : "name_asc"}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm sm:w-44"
            >
              <option value="name_asc">Nama A–Z</option>
              <option value="name_desc">Nama Z–A</option>
            </select>
          </div>
          <button
            type="submit"
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white sm:mb-0"
          >
            Terapkan
          </button>
        </form>

        <ul className="mt-6 divide-y divide-zinc-100">
          {categories.length === 0 ? (
            <li className="py-8 text-center text-sm text-zinc-500">
              {q ? "Tidak ada kategori cocok." : "Belum ada kategori. Tambahkan di atas."}
            </li>
          ) : (
            categories.map((c) => <CategoryRow key={c.id} category={c} />)
          )}
        </ul>
      </div>
    </div>
  );
}

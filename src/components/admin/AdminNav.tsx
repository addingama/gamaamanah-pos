import Link from "next/link";

const links = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/products", label: "Barang" },
  { href: "/admin/price-history", label: "Riwayat Harga" },
  { href: "/admin/stock-history", label: "Riwayat Stok" },
  { href: "/admin/categories", label: "Kategori" },
];

export function AdminNav() {
  return (
    <nav className="flex flex-wrap gap-2 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          {l.label}
        </Link>
      ))}
      <form action="/admin/logout" method="post" className="ml-auto">
        <button
          type="submit"
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Keluar
        </button>
      </form>
    </nav>
  );
}

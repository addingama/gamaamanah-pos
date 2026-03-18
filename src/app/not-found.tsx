import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-center text-zinc-900">
      <h1 className="text-2xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="mt-2 max-w-sm text-sm text-zinc-600">Alamat yang Anda buka tidak ada atau sudah dipindah.</p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
      >
        Ke beranda
      </Link>
    </div>
  );
}

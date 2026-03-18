"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-center text-zinc-900">
      <h1 className="text-2xl font-semibold">Terjadi kesalahan</h1>
      <p className="mt-2 max-w-sm text-sm text-zinc-600">
        Aplikasi mengalami gangguan. Silakan coba lagi atau muat ulang halaman.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
      >
        Coba lagi
      </button>
    </div>
  );
}

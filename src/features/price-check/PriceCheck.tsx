"use client";

import * as React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { publicProductsResponseSchema } from "@/lib/api/public-products";
import type { PublicProduct } from "./types";
import { ProductCard } from "./ProductCard";
import { SkeletonList } from "./SkeletonList";

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

async function fetchProducts(query: string, signal: AbortSignal): Promise<PublicProduct[]> {
  const res = await fetch(`/api/public/products?q=${encodeURIComponent(query)}`, { signal });
  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      json && typeof json === "object" && "error" in json && typeof (json as { error: unknown }).error === "string"
        ? (json as { error: string }).error
        : "Gagal memuat data.";
    throw new Error(msg);
  }
  const parsed = publicProductsResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Format data tidak dikenali.");
  }
  return parsed.data.items;
}

export function PriceCheck() {
  const [q, setQ] = React.useState("");
  const debounced = useDebouncedValue(q, 250);
  const [items, setItems] = React.useState<PublicProduct[]>([]);
  const [isFetching, setIsFetching] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [retryKey, setRetryKey] = React.useState(0);

  React.useEffect(() => {
    const query = debounced.trim();
    if (query.length === 0) {
      setItems([]);
      setError(null);
      setIsFetching(false);
      return;
    }

    const controller = new AbortController();
    setIsFetching(true);
    setError(null);

    fetchProducts(query, controller.signal)
      .then(setItems)
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Terjadi kesalahan. Coba lagi.");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsFetching(false);
      });

    return () => controller.abort();
  }, [debounced, retryKey]);

  const query = debounced.trim();
  const showSkeleton = query.length > 0 && isFetching && items.length === 0;
  const showEmpty = query.length > 0 && !isFetching && items.length === 0 && !error;

  return (
    <div className="min-h-screen bg-zinc-50 pb-10 text-zinc-900">
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Cek Harga</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Cari berdasarkan <span className="font-medium">nama</span>, <span className="font-medium">kode</span>, atau{" "}
          <span className="font-medium">barcode</span>. Hanya barang yang dijual (aktif).
        </p>

        <div className="mt-5">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ketik nama, kode, atau barcode…"
            inputMode="search"
            autoComplete="off"
            spellCheck={false}
            aria-label="Cari barang"
          />
        </div>

        <section className="mt-6" aria-live="polite">
          {query.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 shadow-sm">
              Mulai ketik untuk mencari. Harga yang ditampilkan adalah harga jual terkini.
            </div>
          ) : null}

          {query.length > 0 && !error ? (
            <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm">
              <p>
                Menampilkan <span className="font-semibold">{items.length}</span> hasil
              </p>
              {isFetching ? (
                <p className="text-xs text-zinc-500" aria-label="Memperbarui hasil">
                  Memperbarui…
                </p>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
              <p className="text-sm font-medium text-rose-900">{error}</p>
              <button
                type="button"
                onClick={() => setRetryKey((k) => k + 1)}
                className="mt-3 rounded-xl bg-rose-900 px-4 py-2 text-sm font-medium text-white hover:bg-rose-800"
              >
                Coba lagi
              </button>
            </div>
          ) : null}

          {showSkeleton ? <SkeletonList /> : null}

          {showEmpty ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 shadow-sm">
              Tidak ada barang aktif yang cocok dengan pencarian ini.
            </div>
          ) : null}

          {items.length > 0 ? (
            <div className="space-y-3">
              {isFetching ? (
                <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 shadow-sm">
                  <span
                    className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900"
                    aria-hidden
                  />
                  Memperbarui hasil…
                </div>
              ) : null}

              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.id}>
                    <ProductCard item={item} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <footer className="mt-10 border-t border-zinc-200 pt-6 text-center text-xs text-zinc-500">
          <p>Toko sembako — penggunaan internal</p>
          <Link href="/admin/login" className="mt-2 inline-block font-medium text-zinc-700 underline-offset-2 hover:underline">
            Masuk admin
          </Link>
        </footer>
      </main>
    </div>
  );
}

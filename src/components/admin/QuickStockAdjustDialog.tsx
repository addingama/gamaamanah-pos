"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { quickStockAdjustAction, type QuickStockState } from "@/app/admin/(panel)/products/actions";

const STOCK_OPTIONS: { value: "IN_STOCK" | "LOW" | "OUT"; label: string }[] = [
  { value: "IN_STOCK", label: "Tersedia" },
  { value: "LOW", label: "Menipis" },
  { value: "OUT", label: "Habis" },
];

const CHANGE_TYPES: { value: string; label: string }[] = [
  { value: "RESTOCK", label: "Restock" },
  { value: "SALE", label: "Penjualan" },
  { value: "ADJUST", label: "Koreksi" },
  { value: "DAMAGE", label: "Rusak/Hilang" },
  { value: "RETURN", label: "Retur" },
  { value: "OTHER", label: "Lainnya" },
];

type Product = { id: string; name: string; stock: string };

type Props = {
  product: Product;
  open: boolean;
  onClose: () => void;
};

export function QuickStockAdjustDialog({ product, open, onClose }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(quickStockAdjustAction, null as QuickStockState | null);

  useEffect(() => {
    if (!state?.ok) return;
    const t = window.setTimeout(() => {
      onClose();
      router.refresh();
    }, 0);
    return () => window.clearTimeout(t);
  }, [state?.ok, onClose, router]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-stock-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-zinc-100 px-4 py-3 sm:px-6">
          <h2 id="quick-stock-title" className="text-lg font-semibold">
            Ubah stok cepat
          </h2>
          <p className="mt-1 truncate text-sm text-zinc-600">{product.name}</p>
        </div>

        <form action={formAction} className="p-4 sm:p-6">
          <input type="hidden" name="productId" value={product.id} />

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-500">Status stok baru</label>
              <select
                name="newStock"
                required
                defaultValue={product.stock}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              >
                {STOCK_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500">Jenis perubahan (wajib)</label>
              <select
                name="changeType"
                required
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              >
                <option value="">— Pilih —</option>
                {CHANGE_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500">Catatan (opsional)</label>
              <input
                name="note"
                type="text"
                placeholder="Contoh: Stok masuk 10 sak"
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              />
            </div>

            {state?.ok === false ? (
              <p className="text-sm text-rose-600" role="alert">
                {state.error}
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {pending ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-800"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

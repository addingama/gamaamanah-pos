"use client";

import { useActionState, type FormEvent } from "react";
import {
  createProductAction,
  updateProductAction,
  type ProductActionState,
} from "./actions";

type Category = { id: string; name: string };

type Props = {
  mode: "create" | "edit";
  categories: Category[];
  defaultValues?: {
    id?: string;
    name: string;
    sku: string;
    barcode: string;
    unit: string;
    price: number;
    buyPrice: number;
    stock: "IN_STOCK" | "LOW" | "OUT";
    isActive: boolean;
    categoryId: string;
  };
};

export function ProductForm({ mode, categories, defaultValues }: Props) {
  const action = mode === "create" ? createProductAction : updateProductAction;
  const [state, formAction, pending] = useActionState(action, null as ProductActionState | null);

  const dv = defaultValues ?? {
    name: "",
    sku: "",
    barcode: "",
    unit: "pcs",
    price: 0,
    buyPrice: 0,
    stock: "IN_STOCK" as const,
    isActive: true,
    categoryId: "",
  };

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    const fd = new FormData(e.currentTarget);
    const price = Number(fd.get("price"));
    const buy = Number(fd.get("buyPrice"));
    if (!Number.isNaN(price) && !Number.isNaN(buy) && price < buy) {
      if (!window.confirm("Harga jual lebih rendah dari harga beli. Tetap simpan?")) {
        e.preventDefault();
      }
    }
  }

  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-6 rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
      {mode === "edit" && dv.id ? <input type="hidden" name="id" value={dv.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama barang" error={state?.ok === false ? state.errors.name?.[0] : undefined}>
          <input
            name="name"
            required
            defaultValue={dv.name}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Satuan" error={state?.ok === false ? state.errors.unit?.[0] : undefined}>
          <input
            name="unit"
            required
            defaultValue={dv.unit}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            placeholder="pcs, kg, sak..."
          />
        </Field>
        <Field label="Kode (SKU)" error={state?.ok === false ? state.errors.sku?.[0] : undefined}>
          <input name="sku" defaultValue={dv.sku} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
        </Field>
        <Field label="Barcode">
          <input name="barcode" defaultValue={dv.barcode} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
        </Field>
        <Field label="Kategori">
          <select
            name="categoryId"
            defaultValue={dv.categoryId}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          >
            <option value="">— Tanpa kategori —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status stok">
          <select
            name="stock"
            defaultValue={dv.stock}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          >
            <option value="IN_STOCK">Tersedia</option>
            <option value="LOW">Menipis</option>
            <option value="OUT">Habis</option>
          </select>
        </Field>
        <Field
          label="Harga jual (Rp)"
          error={state?.ok === false ? state.errors.price?.[0] : undefined}
        >
          <input
            name="price"
            type="number"
            min={0}
            step={1}
            required
            defaultValue={dv.price}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          />
        </Field>
        <Field
          label="Harga beli (Rp)"
          error={state?.ok === false ? state.errors.buyPrice?.[0] : undefined}
        >
          <input
            name="buyPrice"
            type="number"
            min={0}
            step={1}
            required
            defaultValue={dv.buyPrice}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Dijual (aktif)">
          <select
            name="isActive"
            defaultValue={dv.isActive ? "true" : "false"}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          >
            <option value="true">Ya — tampil di cek harga</option>
            <option value="false">Tidak</option>
          </select>
        </Field>
      </div>

      {state?.ok === false && state.message ? (
        <p className="text-sm text-rose-600">{state.message}</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : mode === "create" ? "Simpan" : "Perbarui"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-zinc-500">{label}</label>
      {children}
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

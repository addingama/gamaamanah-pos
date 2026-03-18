"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createCategoryAction, type CategoryActionState } from "./actions";

export function CategoryCreateForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createCategoryAction, null as CategoryActionState | null);

  useEffect(() => {
    if (!state?.ok) return;
    const t = window.setTimeout(() => {
      const form = document.getElementById("category-create-form") as HTMLFormElement | null;
      form?.reset();
      router.refresh();
    }, 0);
    return () => window.clearTimeout(t);
  }, [state?.ok, router]);

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold">Tambah kategori</h2>
      <form id="category-create-form" action={formAction} className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="new-name" className="text-xs font-medium text-zinc-500">
            Nama
          </label>
          <input
            id="new-name"
            name="name"
            required
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            placeholder="Contoh: Beras"
          />
          {state?.ok === false && state.errors.name ? (
            <p className="mt-1 text-xs text-rose-600">{state.errors.name[0]}</p>
          ) : null}
        </div>
        <div className="min-w-0 flex-1 sm:max-w-xs">
          <label htmlFor="new-slug" className="text-xs font-medium text-zinc-500">
            Slug (opsional)
          </label>
          <input
            id="new-slug"
            name="slug"
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            placeholder="Otomatis dari nama"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
      {state?.ok ? <p className="mt-2 text-sm text-emerald-700">Kategori tersimpan.</p> : null}
    </div>
  );
}

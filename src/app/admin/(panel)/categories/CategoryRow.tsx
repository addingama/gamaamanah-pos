"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateCategoryAction, deleteCategoryAction, type CategoryActionState } from "./actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

type Cat = { id: string; name: string; slug: string | null };

export function CategoryRow({ category }: { category: Cat }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updateCategoryAction, null as CategoryActionState | null);

  useEffect(() => {
    if (!state?.ok) return;
    const t = window.setTimeout(() => {
      setOpen(false);
      router.refresh();
    }, 0);
    return () => window.clearTimeout(t);
  }, [state?.ok, router]);

  return (
    <li className="py-4">
      {!open ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-zinc-900">{category.name}</p>
            {category.slug ? (
              <p className="text-xs text-zinc-500">/{category.slug}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-xl border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Ubah
            </button>
            <form action={deleteCategoryAction}>
              <input type="hidden" name="id" value={category.id} />
              <ConfirmDeleteButton className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-800 hover:bg-rose-100" />
            </form>
          </div>
        </div>
      ) : (
        <form action={formAction} className="space-y-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-4">
          <input type="hidden" name="id" value={category.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-zinc-500">Nama</label>
              <input
                name="name"
                defaultValue={category.name}
                required
                className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
              />
              {state?.ok === false && state.errors.name ? (
                <p className="mt-1 text-xs text-rose-600">{state.errors.name[0]}</p>
              ) : null}
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500">Slug</label>
              <input
                name="slug"
                defaultValue={category.slug ?? ""}
                className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {pending ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800"
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </li>
  );
}

"use client";

import { useState } from "react";
import { QuickStockAdjustDialog } from "./QuickStockAdjustDialog";

type Product = { id: string; name: string; stock: string };

export function QuickStockTrigger({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
      >
        Stok
      </button>
      <QuickStockAdjustDialog
        product={product}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

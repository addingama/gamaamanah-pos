"use client";

import { Badge } from "@/components/ui/Badge";
import { formatRupiah, formatTanggalId } from "@/lib/format";
import type { PublicProduct } from "./types";

function stockLabel(stock: PublicProduct["stock"]) {
  switch (stock) {
    case "IN_STOCK":
      return { label: "Tersedia", variant: "success" as const };
    case "LOW":
      return { label: "Menipis", variant: "warning" as const };
    case "OUT":
      return { label: "Habis", variant: "danger" as const };
    default:
      return { label: String(stock), variant: "default" as const };
  }
}

export function ProductCard({ item }: { item: PublicProduct }) {
  const stock = stockLabel(item.stock);

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-zinc-900">{item.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
            {item.sku ? <span>Kode: {item.sku}</span> : null}
            {item.barcode ? <span>• Barcode: {item.barcode}</span> : null}
            {item.category ? <span>• Kategori: {item.category}</span> : null}
            <span>• Satuan: {item.unit}</span>
          </div>
          {item.locationNote?.trim() ? (
            <p className="mt-2 text-xs text-zinc-600">
              Lokasi: <span className="font-medium text-zinc-800">{item.locationNote}</span>
            </p>
          ) : null}
        </div>
        <Badge variant={stock.variant}>{stock.label}</Badge>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-zinc-500">Harga jual</p>
          <p className="mt-1 truncate text-2xl font-bold tracking-tight text-zinc-900">
            {formatRupiah(item.price)}
          </p>
        </div>
        <div className="text-right text-xs text-zinc-500">
          <p>Update</p>
          <p className="font-medium text-zinc-700">{formatTanggalId(item.updatedAt, { dateStyle: "medium" })}</p>
        </div>
      </div>
    </div>
  );
}


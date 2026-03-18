export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

type FormatTanggalOptions = {
  dateStyle?: "full" | "long" | "medium" | "short";
  timeStyle?: "full" | "long" | "medium" | "short";
};

export function formatTanggalId(value: Date | string | number, options: FormatTanggalOptions = {}) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: options.dateStyle ?? "long",
    ...(options.timeStyle ? { timeStyle: options.timeStyle } : {}),
  }).format(date);
}


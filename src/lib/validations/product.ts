import { z } from "zod";

const stockEnum = z.enum(["IN_STOCK", "LOW", "OUT"]);

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi.").max(200),
  sku: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((s) => (s === "" ? undefined : s)),
  barcode: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((s) => (s === "" ? undefined : s)),
  unit: z.string().trim().min(1, "Satuan wajib diisi.").max(40),
  price: z.coerce.number().int().min(0, "Harga jual minimal 0."),
  buyPrice: z.coerce.number().int().min(0, "Harga beli minimal 0."),
  stock: stockEnum,
  isActive: z.preprocess(
    (v) => v === true || v === "true" || v === "on",
    z.boolean(),
  ),
  categoryId: z
    .string()
    .trim()
    .optional()
    .transform((s) => (s === "" ? undefined : s)),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

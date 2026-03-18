import { z } from "zod";

export const publicProductSchema = z.object({
  id: z.string(),
  sku: z.string().nullable(),
  barcode: z.string().nullable(),
  name: z.string(),
  category: z.string().nullable(),
  unit: z.string(),
  price: z.number().int(),
  stock: z.enum(["IN_STOCK", "LOW", "OUT"]),
  updatedAt: z.string(),
});

export const publicProductsResponseSchema = z.object({
  items: z.array(publicProductSchema),
});

export type PublicProductDto = z.infer<typeof publicProductSchema>;

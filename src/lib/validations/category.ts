import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi.").max(120),
  slug: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((s) => (s === "" ? undefined : s)),
});

export const categoryUpdateSchema = categoryCreateSchema.extend({
  id: z.string().min(1),
});

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;

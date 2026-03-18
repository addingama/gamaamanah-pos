"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
} from "@/lib/validations/category";

function slugify(name: string) {
  const s = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return s || "kategori";
}

export type CategoryActionState =
  | { ok: true }
  | { ok: false; errors: Record<string, string[]>; message?: string };

export async function createCategoryAction(
  _prev: CategoryActionState | null,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdminSession();
  if (!formData || typeof formData.get !== "function") {
    return { ok: false, errors: { name: ["Data form tidak valid."] } };
  }
  const raw = {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
  };
  const parsed = categoryCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  const slugInput = parsed.data.slug;
  let slug: string | null = slugInput ? slugify(slugInput) : null;
  if (!slug) slug = slugify(parsed.data.name);

  try {
    await prisma.category.create({
      data: { name: parsed.data.name.trim(), slug },
    });
  } catch (e: unknown) {
    const code = e && typeof e === "object" && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "P2002") {
      try {
        await prisma.category.create({
          data: {
            name: parsed.data.name.trim(),
            slug: `${slugify(parsed.data.name)}-${Date.now().toString(36)}`,
          },
        });
      } catch {
        return { ok: false, errors: { name: ["Gagal menyimpan kategori."] } };
      }
    } else {
      return { ok: false, errors: { name: ["Gagal menyimpan kategori."] } };
    }
  }
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function updateCategoryAction(
  _prev: CategoryActionState | null,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdminSession();
  if (!formData || typeof formData.get !== "function") {
    return { ok: false, errors: { name: ["Data form tidak valid."] } };
  }
  const raw = {
    id: String(formData.get("id") ?? ""),
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
  };
  const parsed = categoryUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  let slug: string | null = parsed.data.slug ? slugify(parsed.data.slug) : null;
  if (!slug) slug = slugify(parsed.data.name);
  try {
    await prisma.category.update({
      where: { id: parsed.data.id },
      data: { name: parsed.data.name.trim(), slug },
    });
  } catch (e: unknown) {
    const code = e && typeof e === "object" && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "P2002") {
      await prisma.category.update({
        where: { id: parsed.data.id },
        data: {
          name: parsed.data.name.trim(),
          slug: `${slugify(parsed.data.name)}-${Date.now().toString(36)}`,
        },
      });
    } else {
      return { ok: false, errors: { name: ["Gagal memperbarui."] } };
    }
  }
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.category.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
}

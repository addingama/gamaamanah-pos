"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { productFormSchema } from "@/lib/validations/product";

export type ProductActionState =
  | { ok: true; id?: string }
  | { ok: false; errors: Record<string, string[]>; message?: string };

function formToObject(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    locationNote: String(formData.get("locationNote") ?? ""),
    sku: String(formData.get("sku") ?? ""),
    barcode: String(formData.get("barcode") ?? ""),
    unit: String(formData.get("unit") ?? ""),
    price: formData.get("price"),
    buyPrice: formData.get("buyPrice"),
    stock: String(formData.get("stock") ?? "IN_STOCK"),
    isActive: formData.get("isActive") === "true" ? "true" : "false",
    categoryId: String(formData.get("categoryId") ?? ""),
  };
}

export async function createProductAction(
  _prev: ProductActionState | null,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdminSession();
  if (!formData || typeof formData.get !== "function") {
    return { ok: false, errors: { name: ["Data form tidak valid."] } };
  }
  const parsed = productFormSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;
  try {
    const p = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: d.name,
          locationNote: d.locationNote ?? null,
          sku: d.sku ?? null,
          barcode: d.barcode ?? null,
          unit: d.unit,
          price: d.price,
          buyPrice: d.buyPrice,
          stock: d.stock,
          isActive: d.isActive,
          categoryId: d.categoryId ?? null,
        },
      });
      await tx.priceHistory.create({
        data: { productId: product.id, previousPrice: 0, newPrice: d.price },
      });
      await tx.stockHistory.create({
        data: {
          productId: product.id,
          previousStock: d.stock,
          newStock: d.stock,
          changeType: "INITIAL",
        },
      });
      return product;
    });
    revalidatePath("/admin/products");
    revalidatePath("/admin/price-history");
    revalidatePath("/admin/stock-history");
    redirect(`/admin/products/${p.id}`);
  } catch (e: unknown) {
    const code = e && typeof e === "object" && "code" in e ? String((e as { code: string }).code) : "";
    const message = e instanceof Error ? e.message : "";
    console.error("createProductAction error", { code, message });
    if (code === "P2002") {
      return {
        ok: false,
        errors: { sku: ["Kode atau barcode sudah dipakai barang lain."] },
      };
    }
    if (code === "P2022") {
      return {
        ok: false,
        errors: { name: ["Skema basis data belum sinkron. Jalankan: npx prisma db push"] },
        message: process.env.NODE_ENV === "development" ? `${code}: ${message}` : undefined,
      };
    }
    return {
      ok: false,
      errors: { name: ["Gagal menyimpan barang."] },
      message: process.env.NODE_ENV === "development" ? `${code || "UNKNOWN"}: ${message}` : undefined,
    };
  }
}

export async function updateProductAction(
  _prev: ProductActionState | null,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdminSession();
  if (!formData || typeof formData.get !== "function") {
    return { ok: false, errors: { name: ["Data form tidak valid."] } };
  }
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, errors: { name: ["ID tidak valid."] } };
  const parsed = productFormSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;
  try {
    const old = await prisma.product.findUnique({ where: { id } });
    if (!old) return { ok: false, errors: { name: ["Barang tidak ditemukan."] } };

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: d.name,
          locationNote: d.locationNote ?? null,
          sku: d.sku ?? null,
          barcode: d.barcode ?? null,
          unit: d.unit,
          price: d.price,
          buyPrice: d.buyPrice,
          stock: d.stock,
          isActive: d.isActive,
          categoryId: d.categoryId ?? null,
        },
      });
      if (old.price !== d.price) {
        await tx.priceHistory.create({
          data: { productId: id, previousPrice: old.price, newPrice: d.price },
        });
      }
      if (old.stock !== d.stock) {
        await tx.stockHistory.create({
          data: {
            productId: id,
            previousStock: old.stock,
            newStock: d.stock,
            changeType: "ADJUST",
            note: "Update dari form",
          },
        });
      }
    });
  } catch (e: unknown) {
    const code = e && typeof e === "object" && "code" in e ? String((e as { code: string }).code) : "";
    const message = e instanceof Error ? e.message : "";
    console.error("updateProductAction error", { code, message });
    if (code === "P2002") {
      return {
        ok: false,
        errors: { sku: ["Kode atau barcode sudah dipakai barang lain."] },
      };
    }
    if (code === "P2022") {
      return {
        ok: false,
        errors: { name: ["Skema basis data belum sinkron. Jalankan: npx prisma db push"] },
        message: process.env.NODE_ENV === "development" ? `${code}: ${message}` : undefined,
      };
    }
    return {
      ok: false,
      errors: { name: ["Gagal memperbarui barang."] },
      message: process.env.NODE_ENV === "development" ? `${code || "UNKNOWN"}: ${message}` : undefined,
    };
  }
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath(`/admin/products/${id}/edit`);
  revalidatePath("/admin/price-history");
  revalidatePath("/admin/stock-history");
  redirect(`/admin/products/${id}`);
}

export async function deleteProductAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.product.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

const stockChangeTypes = [
  "RESTOCK",
  "SALE",
  "ADJUST",
  "DAMAGE",
  "RETURN",
  "OTHER",
] as const;

export type QuickStockState =
  | { ok: true }
  | { ok: false; error: string };

export async function quickStockAdjustAction(
  _prev: QuickStockState | null,
  formData: FormData,
): Promise<QuickStockState> {
  await requireAdminSession();
  if (!formData || typeof formData.get !== "function") {
    return { ok: false, error: "Data form tidak valid." };
  }
  const productId = String(formData.get("productId") ?? "").trim();
  const newStock = formData.get("newStock");
  const changeType = formData.get("changeType");
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!productId) return { ok: false, error: "Barang tidak valid." };
  const validStock = newStock === "IN_STOCK" || newStock === "LOW" || newStock === "OUT";
  if (!validStock) return { ok: false, error: "Status stok tidak valid." };
  const validType = stockChangeTypes.includes(changeType as (typeof stockChangeTypes)[number]);
  if (!validType) return { ok: false, error: "Jenis perubahan wajib dipilih." };

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { ok: false, error: "Barang tidak ditemukan." };
  if (product.stock === newStock) return { ok: false, error: "Stok tidak berubah." };

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: { stock: newStock },
    });
    await tx.stockHistory.create({
      data: {
        productId,
        previousStock: product.stock,
        newStock: newStock as "IN_STOCK" | "LOW" | "OUT",
        changeType: changeType as (typeof stockChangeTypes)[number],
        note,
      },
    });
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin/products/" + productId);
  revalidatePath("/admin/stock-history");
  return { ok: true };
}

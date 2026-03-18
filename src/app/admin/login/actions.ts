"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createAdminSession } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(1),
  next: z.string().optional(),
});

function decodeHashFromEnv(value: string): string {
  const raw = value.trim();
  if (raw.startsWith("$2a$") || raw.startsWith("$2b$")) return raw;
  if (raw.startsWith("$10$") && !raw.startsWith("$2b$"))
    return "$2b$" + raw;
  try {
    const decoded = Buffer.from(raw, "base64").toString("utf8");
    if (decoded.startsWith("$2a$") || decoded.startsWith("$2b$"))
      return decoded;
  } catch {
    // bukan base64 valid, fallthrough ke error
  }
  throw new Error(
    "ADMIN_PASSWORD_HASH tidak valid. Gunakan base64 dari hash bcrypt (lihat README).",
  );
}

function getAdminConfig() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const passwordHashRaw = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (!email) throw new Error("ADMIN_EMAIL is required");
  if (!passwordHashRaw)
    throw new Error("ADMIN_PASSWORD_HASH is required");
  const passwordHash = decodeHashFromEnv(passwordHashRaw);
  return { email, passwordHash };
}

export type LoginActionState = { ok: false; message: string } | null;

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  if (!formData || typeof (formData as FormData).get !== "function") {
    return { ok: false as const, message: "Form tidak valid." };
  }
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    next: formData.get("next") ? String(formData.get("next")) : undefined,
  };

  const parsed = LoginSchema.safeParse(raw);

  if (!parsed.success) return { ok: false as const, message: "Input tidak valid." };

  const email = parsed.data.email.trim();
  const password = parsed.data.password;
  const next = parsed.data.next;
  let cfg: { email: string; passwordHash: string };
  try {
    cfg = getAdminConfig();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server belum dikonfigurasi.";
    return { ok: false as const, message: msg };
  }

  if (email.toLowerCase() !== cfg.email.toLowerCase())
    return { ok: false as const, message: "Email atau password salah." };

  const ok = await bcrypt.compare(password, cfg.passwordHash);
  if (!ok)
    return {
      ok: false as const,
      message:
        "Email atau password salah. Cek: npm run verify-password -- <password-kamu>",
    };

  await createAdminSession(cfg.email);
  redirect(next && next.startsWith("/admin") ? next : "/admin");
}


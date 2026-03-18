"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminSession } from "@/lib/auth";

const HARDCODED_ADMIN_EMAIL = "admin@gmail.com";
const HARDCODED_ADMIN_PASSWORD = "@Password123";

const LoginSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(1),
  next: z.string().optional(),
});

function getAdminConfig() {
  return {
    email: HARDCODED_ADMIN_EMAIL,
    password: HARDCODED_ADMIN_PASSWORD,
  };
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
  const cfg = getAdminConfig();

  if (email.toLowerCase() !== cfg.email.toLowerCase())
    return { ok: false as const, message: "Email atau password salah." };

  if (password !== cfg.password)
    return {
      ok: false as const,
      message: "Email atau password salah.",
    };

  await createAdminSession(cfg.email);
  redirect(next && next.startsWith("/admin") ? next : "/admin");
}

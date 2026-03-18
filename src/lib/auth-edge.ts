import { jwtVerify } from "jose";

const COOKIE_NAME = "admin_session";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required");
  return new TextEncoder().encode(secret);
}

export function getAdminCookieName() {
  return COOKIE_NAME;
}

export async function verifyAdminToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret(), { subject: "admin" });
  const email = typeof payload.email === "string" ? payload.email : null;
  if (!email) throw new Error("Invalid token payload");
  return { email };
}


import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "admin_session";

type AdminSessionPayload = {
  sub: "admin";
  email: string;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required");
  return new TextEncoder().encode(secret);
}

export async function createAdminSession(email: string) {
  const days = Number(process.env.ADMIN_SESSION_DAYS ?? "7");
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const token = await new SignJWT({ email } satisfies Omit<AdminSessionPayload, "sub">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime(Math.floor(expires.getTime() / 1000))
    .sign(getSecret());

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function getAdminSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret(), { subject: "admin" });
    const email = typeof payload.email === "string" ? payload.email : null;
    if (!email) return null;
    return { email };
  } catch {
    return null;
  }
}


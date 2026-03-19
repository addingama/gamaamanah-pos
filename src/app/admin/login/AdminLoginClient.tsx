"use client";

import { useSearchParams } from "next/navigation";
import * as React from "react";
import { loginAction, type LoginActionState } from "./actions";

export function AdminLoginClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  const [state, formAction, pending] = React.useActionState(loginAction, null as LoginActionState);
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Masuk admin</h1>
        <p className="mt-2 text-sm text-zinc-600">Masukkan kredensial yang dikonfigurasi di server.</p>

        <form action={formAction} className="mt-8 space-y-4 rounded-2xl border bg-white p-6">
          <input type="hidden" name="next" value={next} />

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              className="w-full rounded-xl border px-3 py-2 outline-none ring-0 focus:border-zinc-400"
              placeholder="admin@local"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="w-full rounded-xl border py-2 pl-3 pr-10 outline-none ring-0 focus:border-zinc-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-zinc-600 hover:text-zinc-900"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M10.733 5.08A10.86 10.86 0 0 1 12 5c6.5 0 10 7 10 7a18.17 18.17 0 0 1-2.196 3.14" />
                    <path d="M6.61 6.61A14.18 14.18 0 0 0 2 12s3.5 7 10 7c1.12 0 2.18-.21 3.17-.58" />
                    <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
                    <path d="M1 1l22 22" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {state?.ok === false ? (
            <p className="text-sm text-red-600" role="alert">
              {state.message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </main>
    </div>
  );
}

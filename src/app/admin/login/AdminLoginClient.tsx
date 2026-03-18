"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { loginAction, type LoginActionState } from "./actions";

export function AdminLoginClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  const [state, formAction, pending] = useActionState(loginAction, null as LoginActionState);

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
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border px-3 py-2 outline-none ring-0 focus:border-zinc-400"
            />
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

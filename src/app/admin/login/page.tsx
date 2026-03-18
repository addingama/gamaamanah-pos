import { Suspense } from "react";
import { AdminLoginClient } from "./AdminLoginClient";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 text-zinc-900">
          <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
            <div className="h-7 w-40 animate-pulse rounded bg-zinc-100" />
            <div className="mt-3 h-4 w-64 animate-pulse rounded bg-zinc-100" />
            <div className="mt-8 h-64 animate-pulse rounded-2xl bg-zinc-100" />
          </main>
        </div>
      }
    >
      <AdminLoginClient />
    </Suspense>
  );
}

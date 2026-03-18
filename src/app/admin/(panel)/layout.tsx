import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Panel admin</p>
            <p className="text-sm text-zinc-800">{session.email}</p>
          </div>
        </div>
        <div className="mx-auto mt-3 max-w-5xl">
          <AdminNav />
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">{children}</div>
    </div>
  );
}

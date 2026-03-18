export default function AdminPanelLoading() {
  return (
    <div className="space-y-6 px-4 py-6 sm:px-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200" />
      <div className="h-32 animate-pulse rounded-2xl bg-zinc-200" />
      <div className="h-64 animate-pulse rounded-2xl bg-zinc-200" />
    </div>
  );
}

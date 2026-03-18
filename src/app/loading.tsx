export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="flex flex-col items-center gap-3">
        <span
          className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900"
          aria-hidden
        />
        <p className="text-sm text-zinc-600">Memuat…</p>
      </div>
    </div>
  );
}

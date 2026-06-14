export default function Loading() {
  return (
    <div className="p-4 md:p-8 max-w-6xl animate-pulse">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-7 w-48 bg-neutral-200 rounded-lg mb-2" />
        <div className="h-4 w-72 bg-neutral-100 rounded" />
      </div>

      {/* Linha 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="sm:col-span-2 rounded-2xl bg-neutral-200 min-h-[180px]" />
        <div className="rounded-2xl bg-neutral-100 min-h-[180px]" />
      </div>

      {/* Linha 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {[0,1,2].map(i => (
          <div key={i} className="rounded-2xl bg-neutral-100 h-48" />
        ))}
      </div>

      {/* Linha 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[0,1].map(i => (
          <div key={i} className="rounded-2xl bg-neutral-100 h-52" />
        ))}
      </div>
    </div>
  );
}

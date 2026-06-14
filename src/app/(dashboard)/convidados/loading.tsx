export default function Loading() {
  return (
    <div className="p-4 md:p-8 animate-pulse">
      <div className="mb-6">
        <div className="h-7 w-40 bg-neutral-200 rounded-lg mb-2" />
        <div className="h-4 w-56 bg-neutral-100 rounded" />
      </div>
      <div className="flex gap-3 mb-6">
        <div className="h-10 w-36 bg-neutral-200 rounded-lg" />
        <div className="h-10 w-36 bg-neutral-100 rounded-lg" />
      </div>
      <div className="space-y-2">
        {Array.from({length: 8}).map((_,i) => (
          <div key={i} className="h-14 bg-neutral-100 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

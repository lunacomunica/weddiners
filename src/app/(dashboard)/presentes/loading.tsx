export default function Loading() {
  return (
    <div className="p-4 md:p-8 animate-pulse">
      <div className="mb-6">
        <div className="h-7 w-36 bg-neutral-200 rounded-lg mb-2" />
        <div className="h-4 w-52 bg-neutral-100 rounded" />
      </div>
      <div className="h-28 bg-neutral-100 rounded-2xl mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({length: 6}).map((_,i) => (
          <div key={i} className="h-48 bg-neutral-100 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

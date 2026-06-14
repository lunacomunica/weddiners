export default function Loading() {
  return (
    <div className="p-4 md:p-8 animate-pulse">
      <div className="mb-6">
        <div className="h-7 w-40 bg-neutral-200 rounded-lg mb-2" />
        <div className="h-4 w-56 bg-neutral-100 rounded" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[0,1,2,3].map(i => <div key={i} className="h-24 bg-neutral-100 rounded-2xl" />)}
      </div>
      <div className="space-y-2">
        {Array.from({length: 6}).map((_,i) => (
          <div key={i} className="h-16 bg-neutral-100 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

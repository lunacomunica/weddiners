export default function Loading() {
  return (
    <div className="p-4 md:p-8 animate-pulse">
      <div className="mb-6">
        <div className="h-7 w-44 bg-neutral-200 rounded-lg mb-2" />
        <div className="h-4 w-60 bg-neutral-100 rounded" />
      </div>
      <div className="space-y-4">
        {[0,1,2].map(i => (
          <div key={i}>
            <div className="h-5 w-32 bg-neutral-200 rounded mb-2" />
            <div className="space-y-2">
              {Array.from({length: 3}).map((_,j) => (
                <div key={j} className="h-12 bg-neutral-100 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

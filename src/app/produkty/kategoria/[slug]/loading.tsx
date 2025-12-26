export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-4 bg-gray-200 rounded w-96 mb-6 animate-pulse" />
      <div className="h-10 bg-gray-200 rounded w-64 mb-8 animate-pulse" />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar Skeleton */}
        <aside className="lg:w-1/4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse" />

            {/* Filter sections skeleton */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="mb-6">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
                <div className="space-y-2">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Products Grid Skeleton */}
        <div className="lg:w-3/4">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse" />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="aspect-square bg-gray-100 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
                  <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
                    <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

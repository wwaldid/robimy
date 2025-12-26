export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Hero Skeleton */}
      <div className="bg-gray-100 h-32 rounded-lg mb-8 animate-pulse" />

      {/* Categories Section */}
      <div className="mb-12">
        <div className="h-8 bg-gray-200 rounded w-64 mb-6 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 h-32 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Featured Products Section */}
      <div>
        <div className="h-8 bg-gray-200 rounded w-64 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
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
  );
}

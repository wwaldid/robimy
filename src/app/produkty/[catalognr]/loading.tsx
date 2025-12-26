export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs skeleton */}
      <div className="h-4 bg-gray-200 rounded w-96 mb-6 animate-pulse" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Image Skeleton */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />

            <div className="space-y-3 pb-6 border-b">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
            </div>

            {/* Color selection skeleton */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-3 animate-pulse" />
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 w-24 bg-gray-100 rounded-md animate-pulse" />
                ))}
              </div>
            </div>

            {/* Size selection skeleton */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-3 animate-pulse" />
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 w-16 bg-gray-100 rounded-md animate-pulse" />
                ))}
              </div>
            </div>

            <div className="pt-6 border-t">
              <div className="h-4 bg-gray-200 rounded w-48 mb-3 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Skeleton */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
          </div>

          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
              <div className="h-10 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}

          <div className="h-12 bg-blue-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

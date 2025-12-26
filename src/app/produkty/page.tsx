import {
  searchProducts,
  getBrands,
  getColors,
  getSizes,
} from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import { FilterOptions } from '@/types/product';
import Link from 'next/link';

// Revalidate every 30 minutes for filtered pages
export const revalidate = 1800;

interface SearchParams {
  search?: string;
  brands?: string;
  colors?: string;
  sizes?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const filters: FilterOptions = {
    search: params.search,
    brands: params.brands?.split(',').filter(Boolean),
    colors: params.colors?.split(',').filter(Boolean),
    sizes: params.sizes?.split(',').filter(Boolean),
  };

  // Run all queries in parallel for better performance
  const [products, brands, colors, sizes] = await Promise.all([
    searchProducts(filters, 100),
    getBrands({
      search: filters.search,
      colors: filters.colors,
      sizes: filters.sizes,
    }),
    getColors({
      search: filters.search,
      brands: filters.brands,
      sizes: filters.sizes,
    }),
    getSizes({
      search: filters.search,
      brands: filters.brands,
      colors: filters.colors,
    }),
  ]);

  const hasActiveFilters =
    filters.search ||
    (filters.brands && filters.brands.length > 0) ||
    (filters.colors && filters.colors.length > 0) ||
    (filters.sizes && filters.sizes.length > 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          Produkty
        </Link>
        {' / '}
        <span className="text-gray-600">
          {filters.search ? `Wyszukiwanie: "${filters.search}"` : 'Wszystkie produkty'}
        </span>
      </nav>

      <h1 className="text-4xl font-bold mb-8">
        {filters.search ? `Wyniki wyszukiwania: "${filters.search}"` : 'Wszystkie produkty'}
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-1/4">
          <ProductFilters
            brands={brands}
            colors={colors}
            sizes={sizes}
          />
        </aside>

        {/* Products Grid */}
        <div className="lg:w-3/4">
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-600">
              {hasActiveFilters ? (
                <>
                  Znaleziono <strong>{products.length}</strong> produktów
                </>
              ) : (
                <>
                  Wyświetlanie <strong>{products.length}</strong> produktów
                </>
              )}
            </p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.catalognr} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">
                Nie znaleziono produktów
              </h3>
              <p className="text-gray-600">
                Spróbuj zmienić kryteria wyszukiwania
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

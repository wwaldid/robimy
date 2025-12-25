import {
  searchProducts,
  getCategories,
  getBrands,
  getColors,
  getSizes,
} from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import { FilterOptions } from '@/types/product';

interface SearchParams {
  search?: string;
  categories?: string;
  brands?: string;
  colors?: string;
  sizes?: string;
}

export default function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filters: FilterOptions = {
    search: searchParams.search,
    categories: searchParams.categories?.split(',').filter(Boolean),
    brands: searchParams.brands?.split(',').filter(Boolean),
    colors: searchParams.colors?.split(',').filter(Boolean),
    sizes: searchParams.sizes?.split(',').filter(Boolean),
  };

  const products = searchProducts(filters, 100);

  // Get filtered options based on active filters
  const categories = getCategories({
    search: filters.search,
    brands: filters.brands,
    colors: filters.colors,
    sizes: filters.sizes,
  });

  const brands = getBrands({
    search: filters.search,
    categories: filters.categories,
    colors: filters.colors,
    sizes: filters.sizes,
  });

  const colors = getColors({
    search: filters.search,
    categories: filters.categories,
    brands: filters.brands,
    sizes: filters.sizes,
  });

  const sizes = getSizes({
    search: filters.search,
    categories: filters.categories,
    brands: filters.brands,
    colors: filters.colors,
  });

  const hasActiveFilters =
    filters.search ||
    (filters.categories && filters.categories.length > 0) ||
    (filters.brands && filters.brands.length > 0) ||
    (filters.colors && filters.colors.length > 0) ||
    (filters.sizes && filters.sizes.length > 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Katalog Produktów</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-1/4">
          <ProductFilters
            categories={categories}
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

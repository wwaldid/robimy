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

// Revalidate every 30 minutes
export const revalidate = 1800;

interface SearchParams {
  brands?: string;
  colors?: string;
  sizes?: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;

  // Decode URL-encoded category name
  const category = decodeURIComponent(slug);

  const filters: FilterOptions = {
    categories: [category],
    brands: searchParamsResolved.brands?.split(',').filter(Boolean),
    colors: searchParamsResolved.colors?.split(',').filter(Boolean),
    sizes: searchParamsResolved.sizes?.split(',').filter(Boolean),
  };

  const products = await searchProducts(filters, 100);

  // Get filtered options based on active filters (excluding category since it's fixed)
  const brands = await getBrands({
    categories: [category],
    colors: filters.colors,
    sizes: filters.sizes,
  });

  const colors = await getColors({
    categories: [category],
    brands: filters.brands,
    sizes: filters.sizes,
  });

  const sizes = await getSizes({
    categories: [category],
    brands: filters.brands,
    colors: filters.colors,
  });

  const hasActiveFilters =
    (filters.brands && filters.brands.length > 0) ||
    (filters.colors && filters.colors.length > 0) ||
    (filters.sizes && filters.sizes.length > 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          Strona główna
        </Link>
        {' / '}
        <Link href="/produkty" className="text-blue-600 hover:text-blue-800">
          Produkty
        </Link>
        {' / '}
        <span className="text-gray-600">{category}</span>
      </nav>

      <h1 className="text-4xl font-bold mb-8">{category}</h1>

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

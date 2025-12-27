import {
  searchProducts,
  countProducts,
  getBrands,
  getColors,
  getSizes,
} from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import PaginationControls from '@/components/PaginationControls';
import { FilterOptions } from '@/types/product';
import Link from 'next/link';

// Revalidate every 30 minutes
export const revalidate = 1800;

interface SearchParams {
  brands?: string;
  colors?: string;
  sizes?: string;
  page?: string;
  perPage?: string;
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

  // Pagination parameters
  const page = parseInt(searchParamsResolved.page || '1', 10);
  const perPage = parseInt(searchParamsResolved.perPage || '20', 10);
  const offset = (page - 1) * perPage;

  const filters: FilterOptions = {
    categories: [category],
    brands: searchParamsResolved.brands?.split(',').filter(Boolean),
    colors: searchParamsResolved.colors?.split(',').filter(Boolean),
    sizes: searchParamsResolved.sizes?.split(',').filter(Boolean),
  };

  // Run all queries in parallel for better performance
  const [products, totalCount, brands, colors, sizes] = await Promise.all([
    searchProducts(filters, perPage, offset),
    countProducts(filters),
    getBrands({
      categories: [category],
      colors: filters.colors,
      sizes: filters.sizes,
    }),
    getColors({
      categories: [category],
      brands: filters.brands,
      sizes: filters.sizes,
    }),
    getSizes({
      categories: [category],
      brands: filters.brands,
      colors: filters.colors,
    }),
  ]);

  const hasActiveFilters =
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
          {products.length > 0 ? (
            <>
              {/* Pagination controls at top */}
              <PaginationControls
                currentPage={page}
                totalItems={totalCount}
                itemsPerPage={perPage}
                position="top"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.catalognr} product={product} />
                ))}
              </div>

              {/* Pagination controls at bottom */}
              <PaginationControls
                currentPage={page}
                totalItems={totalCount}
                itemsPerPage={perPage}
                position="bottom"
              />
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">
                Nie znaleziono produktów
              </h3>
              <p className="text-gray-600">
                {hasActiveFilters
                  ? 'Spróbuj zmienić kryteria wyszukiwania'
                  : 'Brak produktów w tej kategorii'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

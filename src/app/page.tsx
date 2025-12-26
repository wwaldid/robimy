import { getCategories } from '@/lib/db';
import SearchHero from '@/components/SearchHero';
import Link from 'next/link';

// Revalidate every 1 hour
export const revalidate = 3600;

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <div>
      {/* Search Hero */}
      <SearchHero />

      <div className="container mx-auto px-4 py-8">
        {/* Categories */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Kategorie produktów</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.slice(0, 16).map((category) => (
              <Link
                key={category}
                href={`/produkty/kategoria/${encodeURIComponent(category)}`}
                className="bg-white py-12 px-6 rounded-lg shadow hover:shadow-lg transition-all text-center border border-gray-100 hover:border-blue-500 flex flex-col items-center justify-center gap-3"
              >
                <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <div className="font-medium text-gray-800">{category}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

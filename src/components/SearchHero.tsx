'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchHero() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/produkty?search=${encodeURIComponent(search.trim())}`);
    } else {
      router.push('/produkty');
    }
  };

  return (
    <section className="bg-white py-16 mb-12">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Znajdź swój idealny produkt reklamowy
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Ponad 180,000 produktów do personalizacji - torby, odzież, kubki i wiele więcej
        </p>

        <form onSubmit={handleSearch} className="relative">
          <div className="flex items-center bg-white border-2 border-gray-300 rounded-full shadow-lg hover:shadow-xl transition-shadow focus-within:border-blue-500">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Czego szukasz? (np. torby, kubki, koszulki...)"
              className="flex-1 px-6 py-4 text-lg rounded-l-full outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-4 rounded-r-full hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

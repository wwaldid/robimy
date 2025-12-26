'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ProductFiltersProps {
  categories: string[];
  brands: string[];
  colors: string[];
  sizes: string[];
}

export default function ProductFilters({
  categories,
  brands,
  colors,
  sizes,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('categories')?.split(',').filter(Boolean) || []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brands')?.split(',').filter(Boolean) || []
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    searchParams.get('colors')?.split(',').filter(Boolean) || []
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    searchParams.get('sizes')?.split(',').filter(Boolean) || []
  );

  // Auto-apply filters when selections change (with debounce for search)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();

      if (search) params.set('search', search);
      if (selectedCategories.length > 0)
        params.set('categories', selectedCategories.join(','));
      if (selectedBrands.length > 0) params.set('brands', selectedBrands.join(','));
      if (selectedColors.length > 0) params.set('colors', selectedColors.join(','));
      if (selectedSizes.length > 0) params.set('sizes', selectedSizes.join(','));

      startTransition(() => {
        router.push(`/produkty?${params.toString()}`);
      });
    }, search !== searchParams.get('search') ? 500 : 0); // 500ms debounce for search, instant for filters

    return () => clearTimeout(timeoutId);
  }, [selectedCategories, selectedBrands, selectedColors, selectedSizes, search]);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (selectedCategories.length > 0)
      params.set('categories', selectedCategories.join(','));
    if (selectedBrands.length > 0) params.set('brands', selectedBrands.join(','));
    if (selectedColors.length > 0) params.set('colors', selectedColors.join(','));
    if (selectedSizes.length > 0) params.set('sizes', selectedSizes.join(','));

    router.push(`/produkty?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    router.push('/produkty');
  };

  const toggleSelection = (
    item: string,
    selected: string[],
    setSelected: (items: string[]) => void
  ) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md relative">
      {/* Loading overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-600">Ładowanie...</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Filtry</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
          disabled={isPending}
        >
          Wyczyść
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Szukaj
          {isPending && <span className="ml-2 text-xs text-blue-600">(szukam...)</span>}
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Wpisz nazwę produktu..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isPending}
        />
      </div>

      {/* Categories */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Kategorie</label>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() =>
                  toggleSelection(category, selectedCategories, setSelectedCategories)
                }
                className="mr-2"
              />
              <span className="text-sm">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Marki</label>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() =>
                  toggleSelection(brand, selectedBrands, setSelectedBrands)
                }
                className="mr-2"
              />
              <span className="text-sm">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Kolory</label>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {colors.map((color) => (
            <label key={color} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedColors.includes(color)}
                onChange={() =>
                  toggleSelection(color, selectedColors, setSelectedColors)
                }
                className="mr-2"
              />
              <span className="text-sm">{color}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Rozmiary</label>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {sizes.map((size) => (
            <label key={size} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSizes.includes(size)}
                onChange={() => toggleSelection(size, selectedSizes, setSelectedSizes)}
                className="mr-2"
              />
              <span className="text-sm">{size}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ContactForm from '@/components/ContactForm';
import ProductImage from '@/components/ProductImage';
import { ProductGroup, ProductVariant } from '@/types/product';

export default function ProductDetailPage() {
  const params = useParams();
  const catalognr = params.catalognr as string;

  const [product, setProduct] = useState<ProductGroup | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${catalognr}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);

        // Auto-select first color and size
        if (data.variants.length > 0) {
          const firstVariant = data.variants[0];
          setSelectedColor(firstVariant.color);
          setSelectedSize(firstVariant.size);
        }

        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [catalognr]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-2xl text-gray-400">Ładowanie...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold mb-2">Produkt nie został znaleziony</h1>
          <Link href="/produkty" className="text-blue-600 hover:text-blue-800">
            Powrót do listy produktów
          </Link>
        </div>
      </div>
    );
  }

  // Get unique colors and sizes
  const uniqueColors = Array.from(
    new Map(
      product.variants
        .filter((v) => v.color)
        .map((v) => [v.color, v])
    ).values()
  );

  const availableSizes = Array.from(
    new Set(
      product.variants
        .filter((v) => !selectedColor || v.color === selectedColor)
        .map((v) => v.size)
        .filter((s): s is string => s !== null && s !== '')
    )
  );

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
        {product.maincategory && (
          <>
            {' / '}
            <Link
              href={`/produkty?categories=${encodeURIComponent(product.maincategory)}`}
              className="text-blue-600 hover:text-blue-800"
            >
              {product.maincategory}
            </Link>
          </>
        )}
        {' / '}
        <span className="text-gray-600">{product.description}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="aspect-square bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center rounded-lg overflow-hidden">
              <ProductImage
                src={product.picturename ? `/images/${product.picturename}` : null}
                alt={product.description || 'Produkt'}
                className="w-full h-full object-contain"
                size="large"
              />
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-500 mb-2">{product.brand}</div>
            <h1 className="text-3xl font-bold mb-4">{product.description}</h1>

            <div className="mb-6 pb-6 border-b">
              <div className="text-sm text-gray-600 mb-2">
                <strong>Nr katalogowy:</strong> {product.catalognr}
              </div>
              {product.maincategory && (
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Kategoria:</strong> {product.maincategory}
                  {product.subcategory && ` / ${product.subcategory}`}
                </div>
              )}
              {product.material && (
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Materiał:</strong> {product.material}
                </div>
              )}
            </div>

            {/* Color Selection */}
            {uniqueColors.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  Wybierz kolor:
                  {selectedColor && (
                    <span className="ml-2 text-blue-600">{selectedColor}</span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedColor(variant.color);
                        // Reset size if not available for this color
                        if (
                          selectedSize &&
                          !product.variants.some(
                            (v) => v.color === variant.color && v.size === selectedSize
                          )
                        ) {
                          setSelectedSize(null);
                        }
                      }}
                      className={`px-4 py-2 rounded-md border-2 transition-all flex items-center gap-2 ${
                        selectedColor === variant.color
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {variant.hexColor && (
                        <span
                          className="w-4 h-4 shrink-0"
                          style={{
                            backgroundColor: `#${variant.hexColor}`,
                            border: '2px solid #000'
                          }}
                        />
                      )}
                      {variant.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  Wybierz rozmiar:
                  {selectedSize && (
                    <span className="ml-2 text-blue-600">{selectedSize}</span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-md border-2 transition-all ${
                        selectedSize === size
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Long Description */}
            {product.longdescription && (
              <div className="mb-6 pt-6 border-t">
                <h3 className="font-semibold mb-2">Opis produktu</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {product.longdescription}
                </p>
              </div>
            )}

            {/* Additional Info */}
            <div className="pt-6 border-t">
              <h3 className="font-semibold mb-3">Dostępne warianty</h3>
              <p className="text-sm text-gray-600">
                Produkt dostępny w <strong>{uniqueColors.length}</strong>{' '}
                {uniqueColors.length === 1 ? 'kolorze' : 'kolorach'}
                {availableSizes.length > 0 &&
                  ` i ${availableSizes.length} ${
                    availableSizes.length === 1 ? 'rozmiarze' : 'rozmiarach'
                  }`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="max-w-2xl mx-auto">
        <ContactForm
          productName={product.description || 'Produkt'}
          catalogNr={product.catalognr}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
        />
      </div>
    </div>
  );
}

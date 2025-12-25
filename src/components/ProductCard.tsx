'use client';

import Link from 'next/link';
import { ProductGroup } from '@/types/product';
import ProductImage from './ProductImage';

interface ProductCardProps {
  product: ProductGroup;
}

export default function ProductCard({ product }: ProductCardProps) {
  const uniqueColors = Array.from(
    new Map(
      product.variants
        .filter((v) => v.color)
        .map((v) => [v.color, v.hexColor])
    ).entries()
  ).map(([color, hexColor]) => ({ color, hexColor }));

  const uniqueSizes = Array.from(
    new Set(
      product.variants
        .map((v) => v.size)
        .filter((s): s is string => s !== null && s !== '')
    )
  );

  return (
    <Link href={`/produkty/${product.catalognr}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer h-full flex flex-col">
        <div className="aspect-square bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
          <ProductImage
            src={product.picturename ? `/images/${product.picturename}` : null}
            alt={product.description || 'Produkt'}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="text-xs text-gray-500 mb-1">{product.brand}</div>
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">
            {product.description || 'Bez nazwy'}
          </h3>
          <div className="text-sm text-gray-600 mb-2">
            {product.maincategory}
            {product.subcategory && ` / ${product.subcategory}`}
          </div>
          <div className="mt-auto">
            <div className="flex flex-wrap gap-2 mb-2">
              {uniqueColors.slice(0, 5).map((colorItem, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1.5"
                >
                  {colorItem.hexColor && (
                    <span
                      className="w-3 h-3 shrink-0"
                      style={{
                        backgroundColor: `#${colorItem.hexColor}`,
                        border: '2px solid #000'
                      }}
                      title={colorItem.color || ''}
                    />
                  )}
                  <span>{colorItem.color}</span>
                </span>
              ))}
              {uniqueColors.length > 5 && (
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                  +{uniqueColors.length - 5}
                </span>
              )}
            </div>
            {uniqueSizes.length > 0 && (
              <div className="text-xs text-gray-500">
                Rozmiary: {uniqueSizes.slice(0, 3).join(', ')}
                {uniqueSizes.length > 3 && ` +${uniqueSizes.length - 3}`}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

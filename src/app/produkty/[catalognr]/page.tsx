import { notFound } from 'next/navigation';
import Link from 'next/link';
import ContactForm from '@/components/ContactForm';
import ProductImage from '@/components/ProductImage';
import ProductVariantSelector from '@/components/ProductVariantSelector';
import { getProductByCatalog } from '@/lib/db';

// Revalidate every hour
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ catalognr: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { catalognr } = await params;
  const product = await getProductByCatalog(catalognr);

  if (!product) {
    notFound();
  }

  // Get unique colors
  const uniqueColors = Array.from(
    new Map(
      product.variants
        .filter((v) => v.color)
        .map((v) => [v.color, v])
    ).values()
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          Strona główna
        </Link>
        {' / '}
        {product.maincategory && (
          <>
            <Link
              href={`/produkty/kategoria/${encodeURIComponent(product.maincategory)}`}
              className="text-blue-600 hover:text-blue-800"
            >
              {product.maincategory}
            </Link>
            {' / '}
          </>
        )}
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
              {product.grammage && (
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Gramatura:</strong> {product.grammage}
                </div>
              )}
              {product.careinstruction && (
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Pielęgnacja:</strong> {product.careinstruction}
                </div>
              )}
            </div>

            {/* Variant Selector - Client Component */}
            <ProductVariantSelector variants={product.variants} />

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
                {product.variants.length > 0 &&
                  ` (łącznie ${product.variants.length} ${
                    product.variants.length === 1 ? 'wariant' : 'wariantów'
                  })`}
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
        />
      </div>
    </div>
  );
}

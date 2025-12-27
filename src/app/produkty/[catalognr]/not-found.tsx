import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😞</div>
        <h1 className="text-2xl font-bold mb-2">Produkt nie został znaleziony</h1>
        <p className="text-gray-600 mb-6">
          Przepraszamy, ale ten produkt nie istnieje lub został usunięty z oferty.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Powrót do strony głównej
        </Link>
      </div>
    </div>
  );
}

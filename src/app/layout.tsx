import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RobiMyNadruki - Katalog Produktów Reklamowych",
  description: "Katalog produktów reklamowych - kubki, torby, odzież i wiele więcej",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-roboto">
        <header>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <a href="/" className="hover:opacity-80 transition-opacity">
                <img
                  src="https://robimynadruki.pl/images/logo-robimynadruki.png"
                  alt="RobiMyNadruki Logo"
                  className="h-24"
                />
              </a>
              <nav className="flex gap-8 text-gray-700">
                <a href="/" className="hover:text-blue-600 transition-colors font-medium">
                  Strona główna
                </a>
                <a href="/produkty" className="hover:text-blue-600 transition-colors font-medium">
                  Produkty
                </a>
              </nav>
            </div>
          </div>
        </header>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-gray-800 text-white mt-12">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <p>&copy; 2025 RobiMyNadruki. Wszystkie prawa zastrzeżone.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

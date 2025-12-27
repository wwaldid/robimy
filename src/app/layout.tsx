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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <header className="bg-white pb-4">
          <div className="container mx-auto px-4">
            <a href="/" className="hover:opacity-80 transition-opacity inline-block">
              <img
                src="https://robimynadruki.pl/images/logo-robimynadruki.png"
                alt="RobiMyNadruki Logo"
                className="h-24"
              />
            </a>
          </div>
        </header>
        <main className="min-h-screen bg-white">
          {children}
        </main>
        <footer className="bg-[#112D4E] text-white mt-24">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <p>&copy; 2025 RobiMyNadruki. Wszystkie prawa zastrzeżone.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

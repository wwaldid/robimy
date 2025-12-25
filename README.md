# RobiMyNadruki - Katalog Produktów Reklamowych

Aplikacja Next.js do przeglądania katalogu produktów reklamowych.

## Funkcjonalności

- **Strona główna** - kafelki z polecanymi produktami i kategoriami
- **Lista produktów** - zaawansowane filtry (kategoria, marka, kolor, rozmiar, wyszukiwanie)
- **Próbki kolorów** - wizualne próbki kolorów obok nazw produktów (HEX)
- **Placeholder dla zdjęć** - elegancki placeholder SVG dla brakujących zdjęć produktów
- **Detal produktu** - pełne informacje z wyborem wariantów (kolor, rozmiar) i próbkami kolorów
- **Formularz kontaktowy** - zapytanie o ofertę dla wybranego produktu

## Technologie

- **Next.js 15** - framework React z App Router
- **TypeScript** - typy dla bezpiecznego kodu
- **Tailwind CSS v4** - najnowsza wersja z @tailwindcss/postcss
- **SQLite + better-sqlite3** - baza danych produktów
- **Responsive design** - działa na wszystkich urządzeniach

## Instalacja

```bash
npm install
```

## Uruchomienie

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem [http://localhost:3000](http://localhost:3000)

## Struktura projektu

```
src/
├── app/
│   ├── layout.tsx                 # Layout główny z nawigacją
│   ├── page.tsx                   # Strona główna
│   ├── produkty/
│   │   ├── page.tsx              # Lista produktów z filtrami
│   │   └── [catalognr]/
│   │       └── page.tsx          # Detal produktu
│   └── api/
│       └── products/
│           └── [catalognr]/
│               └── route.ts      # API endpoint dla produktu
├── components/
│   ├── ProductCard.tsx           # Kafelek produktu
│   ├── ProductFilters.tsx        # Filtry na liście
│   └── ContactForm.tsx           # Formularz kontaktowy
├── lib/
│   └── db.ts                     # Funkcje do obsługi bazy danych
└── types/
    └── product.ts                # Typy TypeScript dla produktów

db/
└── products.db                   # Baza danych SQLite

public/
└── images/                       # Zdjęcia produktów
```

## Baza danych

Aplikacja korzysta z bazy SQLite (`db/products.db`) zawierającej:
- Tabelę `products` z ponad 180,000 wariantów produktów
- Indeksy dla szybkiego wyszukiwania
- Full-text search (FTS5) dla wyszukiwania tekstowego

### Główne pola w bazie:
- `catalognr` - numer katalogowy (grupuje warianty)
- `articlenr` - unikalny numer artykułu
- `brand` - marka produktu
- `description` - nazwa produktu
- `color1-4`, `hexcol1-4` - kolory wariantu
- `size` - rozmiar
- `maincategory`, `subcategory` - kategorie
- `material` - materiał
- `picturename` - nazwa pliku ze zdjęciem

## Zdjęcia produktów

Zdjęcia produktów powinny być umieszczone w folderze `public/images/` z nazwami odpowiadającymi polu `picturename` w bazie danych.

## Dalszy rozwój

Możliwe rozszerzenia:
- Obsługa koszyka zakupowego
- Panel administracyjny
- Integracja z systemem CRM/mailingowym
- Eksport zapytań do pliku
- Ulubione produkty użytkownika
- Porównywarka produktów

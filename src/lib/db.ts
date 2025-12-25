import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { Product, ProductGroup, FilterOptions } from '@/types/product';

const DB_URL = 'https://studiowaldo.pl/db/products.db';
const dbPath = path.join(process.cwd(), 'db', 'products.db');
let db: Database.Database | null = null;
let downloadPromise: Promise<void> | null = null;

async function downloadDatabase() {
  // Check if database already exists locally
  if (fs.existsSync(dbPath)) {
    return;
  }

  console.log('Downloading database from', DB_URL);

  // Create db directory if it doesn't exist
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Download the database
  const response = await fetch(DB_URL);
  if (!response.ok) {
    throw new Error(`Failed to download database: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  fs.writeFileSync(dbPath, buffer);
  console.log('Database downloaded successfully');
}

function getDb() {
  if (!db) {
    // Check if database exists, if not throw error with helpful message
    if (!fs.existsSync(dbPath)) {
      throw new Error('Database not found. Please ensure the database is downloaded first.');
    }
    db = new Database(dbPath, { readonly: true });
  }
  return db;
}

// Initialize database download on module load
if (typeof window === 'undefined') {
  downloadPromise = downloadDatabase().catch(err => {
    console.error('Failed to download database:', err);
  });
}

export function getProductGroups(limit = 20, offset = 0): ProductGroup[] {
  const database = getDb();

  const query = `
    SELECT
      catalognr,
      brand,
      description,
      longdescription,
      picturename,
      maincategory,
      subcategory,
      material
    FROM products
    WHERE discontinued = 0
    GROUP BY catalognr
    ORDER BY catalognr
    LIMIT ? OFFSET ?
  `;

  const products = database.prepare(query).all(limit, offset) as any[];

  return products.map((product) => {
    const variants = getProductVariants(product.catalognr);
    return {
      ...product,
      variants,
    };
  });
}

export function getProductVariants(catalognr: string) {
  const database = getDb();

  const query = `
    SELECT
      id,
      color1 as color,
      hexcol1 as hexColor,
      size
    FROM products
    WHERE catalognr = ? AND discontinued = 0
    ORDER BY color1, size
  `;

  return database.prepare(query).all(catalognr);
}

export function getProductById(id: number): Product | null {
  const database = getDb();

  const query = `SELECT * FROM products WHERE id = ? AND discontinued = 0`;
  const product = database.prepare(query).get(id) as Product | undefined;

  return product || null;
}

export function getProductByCatalog(catalognr: string): ProductGroup | null {
  const database = getDb();

  const query = `
    SELECT
      catalognr,
      brand,
      description,
      longdescription,
      picturename,
      maincategory,
      subcategory,
      material,
      grammage,
      careinstruction,
      collections,
      material
    FROM products
    WHERE catalognr = ? AND discontinued = 0
    LIMIT 1
  `;

  const product = database.prepare(query).get(catalognr) as any;

  if (!product) return null;

  const variants = getProductVariants(catalognr);

  return {
    ...product,
    variants,
  };
}

export function searchProducts(filters: FilterOptions, limit = 20, offset = 0): ProductGroup[] {
  const database = getDb();

  let query = `
    SELECT
      catalognr,
      brand,
      description,
      longdescription,
      picturename,
      maincategory,
      subcategory,
      material
    FROM products
    WHERE discontinued = 0
  `;

  const params: any[] = [];

  if (filters.search) {
    query += ` AND (description LIKE ? OR longdescription LIKE ? OR brand LIKE ?)`;
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (filters.categories && filters.categories.length > 0) {
    query += ` AND maincategory IN (${filters.categories.map(() => '?').join(',')})`;
    params.push(...filters.categories);
  }

  if (filters.brands && filters.brands.length > 0) {
    query += ` AND brand IN (${filters.brands.map(() => '?').join(',')})`;
    params.push(...filters.brands);
  }

  if (filters.colors && filters.colors.length > 0) {
    query += ` AND (color1 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color2 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color3 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color4 IN (${filters.colors.map(() => '?').join(',')}))`;
    params.push(...filters.colors, ...filters.colors, ...filters.colors, ...filters.colors);
  }

  if (filters.sizes && filters.sizes.length > 0) {
    query += ` AND size IN (${filters.sizes.map(() => '?').join(',')})`;
    params.push(...filters.sizes);
  }

  query += ` GROUP BY catalognr ORDER BY catalognr LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const products = database.prepare(query).all(...params) as any[];

  return products.map((product) => {
    const variants = getProductVariants(product.catalognr);
    return {
      ...product,
      variants,
    };
  });
}

export function getCategories(filters?: Partial<FilterOptions>): string[] {
  const database = getDb();

  let query = `
    SELECT DISTINCT maincategory
    FROM products
    WHERE maincategory IS NOT NULL AND maincategory != '' AND discontinued = 0
  `;

  const params: any[] = [];

  if (filters?.search) {
    query += ` AND (description LIKE ? OR longdescription LIKE ? OR brand LIKE ?)`;
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (filters?.brands && filters.brands.length > 0) {
    query += ` AND brand IN (${filters.brands.map(() => '?').join(',')})`;
    params.push(...filters.brands);
  }

  if (filters?.colors && filters.colors.length > 0) {
    query += ` AND (color1 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color2 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color3 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color4 IN (${filters.colors.map(() => '?').join(',')}))`;
    params.push(...filters.colors, ...filters.colors, ...filters.colors, ...filters.colors);
  }

  if (filters?.sizes && filters.sizes.length > 0) {
    query += ` AND size IN (${filters.sizes.map(() => '?').join(',')})`;
    params.push(...filters.sizes);
  }

  query += ` ORDER BY maincategory`;

  const rows = database.prepare(query).all(...params) as { maincategory: string }[];
  return rows.map((row) => row.maincategory);
}

export function getBrands(filters?: Partial<FilterOptions>): string[] {
  const database = getDb();

  let query = `
    SELECT DISTINCT brand
    FROM products
    WHERE brand IS NOT NULL AND brand != '' AND discontinued = 0
  `;

  const params: any[] = [];

  if (filters?.search) {
    query += ` AND (description LIKE ? OR longdescription LIKE ? OR brand LIKE ?)`;
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (filters?.categories && filters.categories.length > 0) {
    query += ` AND maincategory IN (${filters.categories.map(() => '?').join(',')})`;
    params.push(...filters.categories);
  }

  if (filters?.colors && filters.colors.length > 0) {
    query += ` AND (color1 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color2 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color3 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color4 IN (${filters.colors.map(() => '?').join(',')}))`;
    params.push(...filters.colors, ...filters.colors, ...filters.colors, ...filters.colors);
  }

  if (filters?.sizes && filters.sizes.length > 0) {
    query += ` AND size IN (${filters.sizes.map(() => '?').join(',')})`;
    params.push(...filters.sizes);
  }

  query += ` ORDER BY brand`;

  const rows = database.prepare(query).all(...params) as { brand: string }[];
  return rows.map((row) => row.brand);
}

export function getColors(filters?: Partial<FilterOptions>): string[] {
  const database = getDb();

  let baseWhere = 'discontinued = 0';
  const params: any[] = [];

  if (filters?.search) {
    baseWhere += ` AND (description LIKE ? OR longdescription LIKE ? OR brand LIKE ?)`;
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (filters?.categories && filters.categories.length > 0) {
    baseWhere += ` AND maincategory IN (${filters.categories.map(() => '?').join(',')})`;
    params.push(...filters.categories);
  }

  if (filters?.brands && filters.brands.length > 0) {
    baseWhere += ` AND brand IN (${filters.brands.map(() => '?').join(',')})`;
    params.push(...filters.brands);
  }

  if (filters?.sizes && filters.sizes.length > 0) {
    baseWhere += ` AND size IN (${filters.sizes.map(() => '?').join(',')})`;
    params.push(...filters.sizes);
  }

  const query = `
    SELECT DISTINCT color1 as color FROM products WHERE color1 IS NOT NULL AND color1 != '' AND ${baseWhere}
    UNION
    SELECT DISTINCT color2 as color FROM products WHERE color2 IS NOT NULL AND color2 != '' AND ${baseWhere}
    UNION
    SELECT DISTINCT color3 as color FROM products WHERE color3 IS NOT NULL AND color3 != '' AND ${baseWhere}
    UNION
    SELECT DISTINCT color4 as color FROM products WHERE color4 IS NOT NULL AND color4 != '' AND ${baseWhere}
    ORDER BY color
  `;

  const allParams = [...params, ...params, ...params, ...params];
  const rows = database.prepare(query).all(...allParams) as { color: string }[];
  return rows.map((row) => row.color);
}

export function getSizes(filters?: Partial<FilterOptions>): string[] {
  const database = getDb();

  let query = `
    SELECT DISTINCT size
    FROM products
    WHERE size IS NOT NULL AND size != '' AND discontinued = 0
  `;

  const params: any[] = [];

  if (filters?.search) {
    query += ` AND (description LIKE ? OR longdescription LIKE ? OR brand LIKE ?)`;
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (filters?.categories && filters.categories.length > 0) {
    query += ` AND maincategory IN (${filters.categories.map(() => '?').join(',')})`;
    params.push(...filters.categories);
  }

  if (filters?.brands && filters.brands.length > 0) {
    query += ` AND brand IN (${filters.brands.map(() => '?').join(',')})`;
    params.push(...filters.brands);
  }

  if (filters?.colors && filters.colors.length > 0) {
    query += ` AND (color1 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color2 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color3 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color4 IN (${filters.colors.map(() => '?').join(',')}))`;
    params.push(...filters.colors, ...filters.colors, ...filters.colors, ...filters.colors);
  }

  query += ` ORDER BY size`;

  const rows = database.prepare(query).all(...params) as { size: string }[];
  return rows.map((row) => row.size);
}

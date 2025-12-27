import { createClient } from '@libsql/client';
import { Product, ProductGroup, FilterOptions } from '@/types/product';
import { unstable_cache } from 'next/cache';

// Validate environment variables
if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error(
    'Missing Turso environment variables. Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in your Vercel project settings.'
  );
}

// Create Turso client
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function getProductGroups(limit = 20, offset = 0): Promise<ProductGroup[]> {
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

  const result = await client.execute({
    sql: query,
    args: [limit, offset]
  });

  // Convert Row objects to plain objects
  const products = result.rows.map(row => ({
    catalognr: String(row.catalognr),
    brand: String(row.brand),
    description: String(row.description),
    longdescription: String(row.longdescription),
    picturename: String(row.picturename),
    maincategory: String(row.maincategory),
    subcategory: String(row.subcategory),
    material: String(row.material),
  }));

  const productGroups = await Promise.all(
    products.map(async (product) => {
      const variants = await getProductVariants(product.catalognr);
      return {
        ...product,
        variants,
      };
    })
  );

  return productGroups;
}

export async function getProductVariants(catalognr: string) {
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

  const result = await client.execute({
    sql: query,
    args: [catalognr]
  });

  // Convert Row objects to plain objects
  return result.rows.map(row => ({
    id: Number(row.id),
    color: String(row.color),
    hexColor: String(row.hexColor),
    size: String(row.size),
  }));
}

export async function getProductById(id: number): Promise<Product | null> {
  const query = `SELECT * FROM products WHERE id = ? AND discontinued = 0`;

  const result = await client.execute({
    sql: query,
    args: [id]
  });

  if (!result.rows[0]) return null;

  // Convert Row object to plain object
  const row = result.rows[0];
  return {
    id: row.id,
    catalognr: row.catalognr,
    brand: row.brand,
    description: row.description,
    longdescription: row.longdescription,
    picturename: row.picturename,
    maincategory: row.maincategory,
    subcategory: row.subcategory,
    material: row.material,
    color1: row.color1,
    color2: row.color2,
    color3: row.color3,
    color4: row.color4,
    hexcol1: row.hexcol1,
    hexcol2: row.hexcol2,
    hexcol3: row.hexcol3,
    hexcol4: row.hexcol4,
    size: row.size,
    discontinued: row.discontinued,
  } as unknown as Product;
}

export async function getProductByCatalog(catalognr: string): Promise<ProductGroup | null> {
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

  const result = await client.execute({
    sql: query,
    args: [catalognr]
  });

  const row = result.rows[0];

  if (!row) return null;

  const variants = await getProductVariants(catalognr);

  // Convert Row object to plain object
  return {
    catalognr: String(row.catalognr),
    brand: String(row.brand),
    description: String(row.description),
    longdescription: String(row.longdescription),
    picturename: String(row.picturename),
    maincategory: String(row.maincategory),
    subcategory: String(row.subcategory),
    material: String(row.material),
    grammage: row.grammage ? String(row.grammage) : undefined,
    careinstruction: row.careinstruction ? String(row.careinstruction) : undefined,
    collections: row.collections ? String(row.collections) : undefined,
    variants,
  } as unknown as ProductGroup;
}

export async function searchProducts(filters: FilterOptions, limit = 20, offset = 0): Promise<ProductGroup[]> {
  // Build WHERE clause for the subquery
  let whereClause = 'discontinued = 0';
  const args: any[] = [];

  if (filters.search) {
    whereClause += ` AND (description LIKE ? OR longdescription LIKE ? OR brand LIKE ?)`;
    const searchTerm = `%${filters.search}%`;
    args.push(searchTerm, searchTerm, searchTerm);
  }

  if (filters.categories && filters.categories.length > 0) {
    whereClause += ` AND maincategory IN (${filters.categories.map(() => '?').join(',')})`;
    args.push(...filters.categories);
  }

  if (filters.brands && filters.brands.length > 0) {
    whereClause += ` AND brand IN (${filters.brands.map(() => '?').join(',')})`;
    args.push(...filters.brands);
  }

  if (filters.colors && filters.colors.length > 0) {
    whereClause += ` AND (color1 IN (${filters.colors.map(() => '?').join(',')})`;
    whereClause += ` OR color2 IN (${filters.colors.map(() => '?').join(',')})`;
    whereClause += ` OR color3 IN (${filters.colors.map(() => '?').join(',')})`;
    whereClause += ` OR color4 IN (${filters.colors.map(() => '?').join(',')}))`;
    args.push(...filters.colors, ...filters.colors, ...filters.colors, ...filters.colors);
  }

  if (filters.sizes && filters.sizes.length > 0) {
    whereClause += ` AND size IN (${filters.sizes.map(() => '?').join(',')})`;
    args.push(...filters.sizes);
  }

  // Optimized query using CTE and leveraging idx_catalognr, idx_maincategory indices
  // First get unique catalognrs, then join to get all variants
  const query = `
    WITH unique_products AS (
      SELECT DISTINCT catalognr
      FROM products
      WHERE ${whereClause}
      ORDER BY catalognr
      LIMIT ? OFFSET ?
    )
    SELECT
      p.id as variant_id,
      p.catalognr,
      p.brand,
      p.description,
      p.longdescription,
      p.picturename,
      p.maincategory,
      p.subcategory,
      p.material,
      p.color1 as variant_color,
      p.hexcol1 as variant_hex_color,
      p.size as variant_size
    FROM unique_products up
    JOIN products p ON up.catalognr = p.catalognr
    WHERE p.discontinued = 0
    ORDER BY p.catalognr, p.color1, p.size
  `;

  args.push(limit, offset);

  const result = await client.execute({
    sql: query,
    args: args
  });

  // Transform flat result into ProductGroup structure
  const productMap = new Map<string, any>();

  for (const row of result.rows) {
    const catalognr = String(row.catalognr);

    if (!productMap.has(catalognr)) {
      productMap.set(catalognr, {
        catalognr: String(row.catalognr),
        brand: String(row.brand),
        description: String(row.description),
        longdescription: String(row.longdescription),
        picturename: String(row.picturename),
        maincategory: String(row.maincategory),
        subcategory: String(row.subcategory),
        material: String(row.material),
        variants: [],
      });
    }

    const productGroup = productMap.get(catalognr)!;
    if (row.variant_id) {
      productGroup.variants.push({
        id: Number(row.variant_id),
        color: String(row.variant_color),
        hexColor: String(row.variant_hex_color),
        size: String(row.variant_size),
      });
    }
  }

  return Array.from(productMap.values()) as ProductGroup[];
}

// Internal function without cache
async function getCategoriesInternal(filters?: Partial<FilterOptions>): Promise<string[]> {
  let query = `
    SELECT DISTINCT maincategory
    FROM products
    WHERE maincategory IS NOT NULL AND maincategory != '' AND discontinued = 0
  `;

  const args: any[] = [];

  if (filters?.search) {
    query += ` AND (description LIKE ? OR longdescription LIKE ? OR brand LIKE ?)`;
    const searchTerm = `%${filters.search}%`;
    args.push(searchTerm, searchTerm, searchTerm);
  }

  if (filters?.brands && filters.brands.length > 0) {
    query += ` AND brand IN (${filters.brands.map(() => '?').join(',')})`;
    args.push(...filters.brands);
  }

  if (filters?.colors && filters.colors.length > 0) {
    query += ` AND (color1 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color2 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color3 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color4 IN (${filters.colors.map(() => '?').join(',')}))`;
    args.push(...filters.colors, ...filters.colors, ...filters.colors, ...filters.colors);
  }

  if (filters?.sizes && filters.sizes.length > 0) {
    query += ` AND size IN (${filters.sizes.map(() => '?').join(',')})`;
    args.push(...filters.sizes);
  }

  query += ` ORDER BY maincategory`;

  const result = await client.execute({
    sql: query,
    args: args
  });

  // Convert Row objects to plain objects and extract values
  return result.rows.map((row) => String(row.maincategory));
}

// Cached version for homepage (no filters)
const getCategoriesCached = unstable_cache(
  async () => getCategoriesInternal(),
  ['all-categories'],
  {
    revalidate: 3600, // 1 hour
    tags: ['categories'],
  }
);

// Export function that uses cache when no filters, otherwise queries directly
export async function getCategories(filters?: Partial<FilterOptions>): Promise<string[]> {
  // If no filters, use cached version
  if (!filters || Object.keys(filters).length === 0) {
    return getCategoriesCached();
  }

  // Otherwise query directly with filters
  return getCategoriesInternal(filters);
}

// Internal function for getBrands
async function getBrandsInternal(filters?: Partial<FilterOptions>): Promise<string[]> {
  // Optimized to use idx_brand index
  let query = `
    SELECT DISTINCT brand
    FROM products
    WHERE brand IS NOT NULL AND brand != '' AND discontinued = 0
  `;

  const args: any[] = [];

  if (filters?.search) {
    query += ` AND (description LIKE ? OR longdescription LIKE ? OR brand LIKE ?)`;
    const searchTerm = `%${filters.search}%`;
    args.push(searchTerm, searchTerm, searchTerm);
  }

  if (filters?.categories && filters.categories.length > 0) {
    // Using idx_maincategory index
    query += ` AND maincategory IN (${filters.categories.map(() => '?').join(',')})`;
    args.push(...filters.categories);
  }

  if (filters?.colors && filters.colors.length > 0) {
    query += ` AND (color1 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color2 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color3 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color4 IN (${filters.colors.map(() => '?').join(',')}))`;
    args.push(...filters.colors, ...filters.colors, ...filters.colors, ...filters.colors);
  }

  if (filters?.sizes && filters.sizes.length > 0) {
    query += ` AND size IN (${filters.sizes.map(() => '?').join(',')})`;
    args.push(...filters.sizes);
  }

  query += ` ORDER BY brand`;

  const result = await client.execute({
    sql: query,
    args: args
  });

  return result.rows.map((row) => String(row.brand));
}

// Cached version for category-only filters
const getBrandsCached = unstable_cache(
  async (category: string) => getBrandsInternal({ categories: [category] }),
  ['brands-by-category'],
  {
    revalidate: 3600,
    tags: ['brands'],
  }
);

export async function getBrands(filters?: Partial<FilterOptions>): Promise<string[]> {
  // Use cache if only filtering by single category (common case)
  if (filters?.categories?.length === 1 && !filters.search && !filters.colors && !filters.sizes) {
    return getBrandsCached(filters.categories[0]);
  }

  return getBrandsInternal(filters);
}

// Internal function for getColors
async function getColorsInternal(filters?: Partial<FilterOptions>): Promise<string[]> {
  let baseWhere = 'discontinued = 0';
  const args: any[] = [];

  if (filters?.search) {
    baseWhere += ` AND (description LIKE ? OR longdescription LIKE ? OR brand LIKE ?)`;
    const searchTerm = `%${filters.search}%`;
    args.push(searchTerm, searchTerm, searchTerm);
  }

  if (filters?.categories && filters.categories.length > 0) {
    // Using idx_maincategory index
    baseWhere += ` AND maincategory IN (${filters.categories.map(() => '?').join(',')})`;
    args.push(...filters.categories);
  }

  if (filters?.brands && filters.brands.length > 0) {
    // Using idx_brand index
    baseWhere += ` AND brand IN (${filters.brands.map(() => '?').join(',')})`;
    args.push(...filters.brands);
  }

  if (filters?.sizes && filters.sizes.length > 0) {
    baseWhere += ` AND size IN (${filters.sizes.map(() => '?').join(',')})`;
    args.push(...filters.sizes);
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

  const allArgs = [...args, ...args, ...args, ...args];

  const result = await client.execute({
    sql: query,
    args: allArgs
  });

  return result.rows.map((row) => String(row.color));
}

// Cached version for category-only filters
const getColorsCached = unstable_cache(
  async (category: string) => getColorsInternal({ categories: [category] }),
  ['colors-by-category'],
  {
    revalidate: 3600,
    tags: ['colors'],
  }
);

export async function getColors(filters?: Partial<FilterOptions>): Promise<string[]> {
  // Use cache if only filtering by single category (common case)
  if (filters?.categories?.length === 1 && !filters.search && !filters.brands && !filters.sizes) {
    return getColorsCached(filters.categories[0]);
  }

  return getColorsInternal(filters);
}

// Internal function for getSizes
async function getSizesInternal(filters?: Partial<FilterOptions>): Promise<string[]> {
  let query = `
    SELECT DISTINCT size
    FROM products
    WHERE size IS NOT NULL AND size != '' AND discontinued = 0
  `;

  const args: any[] = [];

  if (filters?.search) {
    query += ` AND (description LIKE ? OR longdescription LIKE ? OR brand LIKE ?)`;
    const searchTerm = `%${filters.search}%`;
    args.push(searchTerm, searchTerm, searchTerm);
  }

  if (filters?.categories && filters.categories.length > 0) {
    // Using idx_maincategory index
    query += ` AND maincategory IN (${filters.categories.map(() => '?').join(',')})`;
    args.push(...filters.categories);
  }

  if (filters?.brands && filters.brands.length > 0) {
    // Using idx_brand index
    query += ` AND brand IN (${filters.brands.map(() => '?').join(',')})`;
    args.push(...filters.brands);
  }

  if (filters?.colors && filters.colors.length > 0) {
    query += ` AND (color1 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color2 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color3 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color4 IN (${filters.colors.map(() => '?').join(',')}))`;
    args.push(...filters.colors, ...filters.colors, ...filters.colors, ...filters.colors);
  }

  query += ` ORDER BY size`;

  const result = await client.execute({
    sql: query,
    args: args
  });

  return result.rows.map((row) => String(row.size));
}

// Cached version for category-only filters
const getSizesCached = unstable_cache(
  async (category: string) => getSizesInternal({ categories: [category] }),
  ['sizes-by-category'],
  {
    revalidate: 3600,
    tags: ['sizes'],
  }
);

export async function getSizes(filters?: Partial<FilterOptions>): Promise<string[]> {
  // Use cache if only filtering by single category (common case)
  if (filters?.categories?.length === 1 && !filters.search && !filters.brands && !filters.colors) {
    return getSizesCached(filters.categories[0]);
  }

  return getSizesInternal(filters);
}

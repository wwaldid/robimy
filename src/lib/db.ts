import { createClient } from '@libsql/client';
import { Product, ProductGroup, FilterOptions } from '@/types/product';

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

  const products = result.rows as any[];

  const productGroups = await Promise.all(
    products.map(async (product) => {
      const variants = await getProductVariants(product.catalognr as string);
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

  return result.rows;
}

export async function getProductById(id: number): Promise<Product | null> {
  const query = `SELECT * FROM products WHERE id = ? AND discontinued = 0`;

  const result = await client.execute({
    sql: query,
    args: [id]
  });

  return (result.rows[0] as unknown as Product) || null;
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

  const product = result.rows[0];

  if (!product) return null;

  const variants = await getProductVariants(catalognr);

  return {
    ...product,
    variants,
  } as unknown as ProductGroup;
}

export async function searchProducts(filters: FilterOptions, limit = 20, offset = 0): Promise<ProductGroup[]> {
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

  const args: any[] = [];

  if (filters.search) {
    query += ` AND (description LIKE ? OR longdescription LIKE ? OR brand LIKE ?)`;
    const searchTerm = `%${filters.search}%`;
    args.push(searchTerm, searchTerm, searchTerm);
  }

  if (filters.categories && filters.categories.length > 0) {
    query += ` AND maincategory IN (${filters.categories.map(() => '?').join(',')})`;
    args.push(...filters.categories);
  }

  if (filters.brands && filters.brands.length > 0) {
    query += ` AND brand IN (${filters.brands.map(() => '?').join(',')})`;
    args.push(...filters.brands);
  }

  if (filters.colors && filters.colors.length > 0) {
    query += ` AND (color1 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color2 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color3 IN (${filters.colors.map(() => '?').join(',')})`;
    query += ` OR color4 IN (${filters.colors.map(() => '?').join(',')}))`;
    args.push(...filters.colors, ...filters.colors, ...filters.colors, ...filters.colors);
  }

  if (filters.sizes && filters.sizes.length > 0) {
    query += ` AND size IN (${filters.sizes.map(() => '?').join(',')})`;
    args.push(...filters.sizes);
  }

  query += ` GROUP BY catalognr ORDER BY catalognr LIMIT ? OFFSET ?`;
  args.push(limit, offset);

  const result = await client.execute({
    sql: query,
    args: args
  });

  const products = result.rows as any[];

  const productGroups = await Promise.all(
    products.map(async (product) => {
      const variants = await getProductVariants(product.catalognr as string);
      return {
        ...product,
        variants,
      };
    })
  );

  return productGroups;
}

export async function getCategories(filters?: Partial<FilterOptions>): Promise<string[]> {
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

  return result.rows.map((row: any) => row.maincategory as string);
}

export async function getBrands(filters?: Partial<FilterOptions>): Promise<string[]> {
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

  return result.rows.map((row: any) => row.brand as string);
}

export async function getColors(filters?: Partial<FilterOptions>): Promise<string[]> {
  let baseWhere = 'discontinued = 0';
  const args: any[] = [];

  if (filters?.search) {
    baseWhere += ` AND (description LIKE ? OR longdescription LIKE ? OR brand LIKE ?)`;
    const searchTerm = `%${filters.search}%`;
    args.push(searchTerm, searchTerm, searchTerm);
  }

  if (filters?.categories && filters.categories.length > 0) {
    baseWhere += ` AND maincategory IN (${filters.categories.map(() => '?').join(',')})`;
    args.push(...filters.categories);
  }

  if (filters?.brands && filters.brands.length > 0) {
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

  return result.rows.map((row: any) => row.color as string);
}

export async function getSizes(filters?: Partial<FilterOptions>): Promise<string[]> {
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
    query += ` AND maincategory IN (${filters.categories.map(() => '?').join(',')})`;
    args.push(...filters.categories);
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

  query += ` ORDER BY size`;

  const result = await client.execute({
    sql: query,
    args: args
  });

  return result.rows.map((row: any) => row.size as string);
}

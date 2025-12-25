export interface Product {
  id: number;
  articlenr: number;
  catalognr: string;
  qtycarton: number;
  color1: string | null;
  color2: string | null;
  color3: string | null;
  color4: string | null;
  hexcol1: string | null;
  hexcol2: string | null;
  hexcol3: string | null;
  hexcol4: string | null;
  size: string | null;
  brand: string | null;
  discontinued: number;
  weight: number | null;
  catnrmanufacturer: string | null;
  artnrmanufacturer: string | null;
  ean: string | null;
  countryoforigin: string | null;
  newdate: string | null;
  picturename: string | null;
  description: string | null;
  longdescription: string | null;
  maincategory: string | null;
  subcategory: string | null;
  consistence: string | null;
  grammage: string | null;
  careinstruction: string | null;
  product: string | null;
  sleeve: string | null;
  legs: string | null;
  nature: string | null;
  colourfulness: string | null;
  function: string | null;
  making_cachet: string | null;
  collections: string | null;
  collar_neckline: string | null;
  label: string | null;
  material: string | null;
  cutting: string | null;
  shopnavigation: string | null;
  workmanship: string | null;
  improving: string | null;
  mixture: string | null;
  partner_article: string | null;
  available_for: string | null;
  manufacturercontactaddress: string | null;
  manufacturercontactemail: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: number;
  color: string | null;
  hexColor: string | null;
  size: string | null;
}

export interface ProductGroup {
  catalognr: string;
  brand: string | null;
  description: string | null;
  longdescription: string | null;
  picturename: string | null;
  maincategory: string | null;
  subcategory: string | null;
  material: string | null;
  variants: ProductVariant[];
}

export interface FilterOptions {
  categories?: string[];
  brands?: string[];
  colors?: string[];
  sizes?: string[];
  search?: string;
}

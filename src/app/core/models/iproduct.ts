export interface IFilterOptionItem {
  name: string;
  count: number;
  hex?: string | null;
}

export interface IFilterCategoryItem {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  count: number;
}

export interface IFilterBrandItem {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface IProductFiltersData {
  price_range: {
    min: number;
    max: number;
  };
  categories: IFilterCategoryItem[];
  brands: IFilterBrandItem[];
  sizes: IFilterOptionItem[];
  colors: IFilterOptionItem[];
  volumes: IFilterOptionItem[];
  other_options: IFilterOptionItem[];
}

export interface IOptionValue {
  id: number;
  product_option_id: number;
  value: string;
  hex_color?: string | null;
  image?: string | null;
  sort_order?: number;
}

export interface IProductOption {
  id: number;
  product_id: number;
  code: string;
  name: string;
  display_type: 'color_swatch' | 'button' | 'dropdown';
  sort_order?: number;
  values: IOptionValue[];
}

export interface IVariant {
  id: number;
  product_id: number;
  name: string;
  price: string | number;
  old_price?: string | number | null;
  stock: number;
  sku?: string | null;
  image?: string | null;
  is_active?: boolean;
  is_default?: boolean;
  option_value_ids?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface Iproduct {
  id: number;
  category_id: number;
  brand_id: number;
  title: string;
  subtitle: string;
  slug: string;
  description: string;
  price: string;
  old_price: string;
  cost_price: null;
  currency: string;
  sku: string;
  stock: number;
  primary_image: string;
  rating: string;
  reviews_count: number;
  badge_label: string;
  badge_tone: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category: Category;
  brand: Brand;
  images: any[];
  tags: Tag[];
  options?: IProductOption[];
  variants?: IVariant[];
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  pivot: Pivot;
}

interface Pivot {
  product_id: number;
  tag_id: number;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: null;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  parent_id: null;
  name: string;
  slug: string;
  image: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

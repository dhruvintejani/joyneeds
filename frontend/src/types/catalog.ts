export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
};

export type Product = {
  id: string;
  legacyId: number | null;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice: number | null;
  discountPercentage: number;
  image: string;
  images: string[];
  shortDescription: string;
  fullDescription?: string;
  features: string[];
  specifications?: Record<string, string>;
  subcategory?: string;
  stockQuantity?: number | null;
  newArrival?: boolean;
  addedAt?: string;
  rating: number | null;
  reviewCount: number;
  featured: boolean;
  bestseller: boolean;
  stockStatus: "in_stock" | "out_of_stock";
  sku: string;
  shippingInfo: string;
  returnInfo: string;
  tags: string[];
};

/**
 * Mock Shopify product/collection catalog for the demo store. Generic ecommerce
 * items only — NO PrimeBuild products or identifiers. In Phase 5 these are read
 * from the Shopify Admin API when a merchant attaches products to a campaign.
 */

export interface MockProduct {
  id: string;
  kind: "product";
  title: string;
  price: number;
  inventory: number;
}

export interface MockCollection {
  id: string;
  kind: "collection";
  title: string;
  productCount: number;
}

export type CatalogRef = MockProduct | MockCollection;

export const mockProducts: MockProduct[] = [
  { id: "prod_tee_classic", kind: "product", title: "Classic Cotton Tee", price: 28, inventory: 340 },
  { id: "prod_hoodie", kind: "product", title: "Everyday Hoodie", price: 62, inventory: 120 },
  { id: "prod_tote", kind: "product", title: "Canvas Tote Bag", price: 24, inventory: 210 },
  { id: "prod_bottle", kind: "product", title: "Insulated Water Bottle", price: 32, inventory: 90 },
  { id: "prod_cap", kind: "product", title: "Six-Panel Cap", price: 26, inventory: 175 },
  { id: "prod_socks", kind: "product", title: "Crew Socks (3-pack)", price: 18, inventory: 500 },
  { id: "prod_mug", kind: "product", title: "Ceramic Mug", price: 16, inventory: 260 },
  { id: "prod_journal", kind: "product", title: "Hardcover Journal", price: 22, inventory: 140 },
];

export const mockCollections: MockCollection[] = [
  { id: "col_bestsellers", kind: "collection", title: "Best Sellers", productCount: 24 },
  { id: "col_new", kind: "collection", title: "New Arrivals", productCount: 12 },
  { id: "col_summer", kind: "collection", title: "Summer Collection", productCount: 18 },
  { id: "col_gifts", kind: "collection", title: "Gift Guide", productCount: 30 },
  { id: "col_sale", kind: "collection", title: "Sale", productCount: 41 },
];

export const catalogRefs: CatalogRef[] = [...mockCollections, ...mockProducts];

export function getCatalogRef(id: string): CatalogRef | undefined {
  return catalogRefs.find((r) => r.id === id);
}

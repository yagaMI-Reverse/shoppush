export interface ProductInput {
  name: string;
  category: string;
  facts: string;
  price: string;
  tone: "premium" | "friendly" | "technical";
}

export interface GeneratedListing {
  title: string;
  description: string;
  bullets: string[];
  tags: string[];
  seoTitle: string;
  seoDescription: string;
}

export interface PushResult {
  mode: "live" | "demo";
  productId: string;
  adminUrl: string | null;
  storefrontTitle: string;
  pushedAt: string;
}

export interface PushedProduct extends PushResult {
  price: string;
  category: string;
}

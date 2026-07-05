import type { GeneratedListing } from "@/lib/types";

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API_VERSION = "2024-10";

interface PushBody {
  listing: GeneratedListing;
  price: string;
  category: string;
}

export async function POST(request: Request) {
  let body: PushBody;
  try {
    body = (await request.json()) as PushBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const { listing, price, category } = body;
  if (!listing?.title) {
    return Response.json({ error: "Nothing to push — generate a listing first." }, { status: 400 });
  }

  // Demo path: no store connected — simulate the push so the flow stays real.
  if (!STORE_DOMAIN || !ADMIN_TOKEN) {
    await new Promise((r) => setTimeout(r, 900));
    return Response.json({
      mode: "demo",
      productId: `demo_${Date.now().toString(36)}`,
      adminUrl: null,
      storefrontTitle: listing.title,
      pushedAt: new Date().toISOString(),
    });
  }

  try {
    const bodyHtml =
      listing.description
        .split("\n\n")
        .map((p) => `<p>${p}</p>`)
        .join("") +
      `<ul>${listing.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>`;

    const res = await fetch(
      `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/products.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ADMIN_TOKEN,
        },
        body: JSON.stringify({
          product: {
            title: listing.title,
            body_html: bodyHtml,
            product_type: category,
            tags: listing.tags.join(", "),
            status: "draft",
            variants: [{ price: price || "0.00" }],
            metafields_global_title_tag: listing.seoTitle,
            metafields_global_description_tag: listing.seoDescription,
          },
        }),
      }
    );

    if (!res.ok) {
      const detail = await res.text();
      console.error("Shopify error:", res.status, detail.slice(0, 300));
      return Response.json(
        { error: `Shopify returned ${res.status}. Check store credentials and scopes.` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const productId: number = data.product?.id;
    return Response.json({
      mode: "live",
      productId: String(productId),
      adminUrl: `https://${STORE_DOMAIN}/admin/products/${productId}`,
      storefrontTitle: data.product?.title ?? listing.title,
      pushedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Push failed:", err);
    return Response.json(
      { error: "Push failed. Check your connection and store credentials." },
      { status: 500 }
    );
  }
}

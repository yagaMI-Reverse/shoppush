# ShopPush — AI Product Listing Studio

🔗 **Live demo:** https://shoppush.vercel.app

Paste raw product facts → AI writes a store-ready listing (title, description, benefit bullets, tags, SEO title/description) → one click creates the product in a Shopify store via the Admin API.

![ShopPush](./screenshot.png)

## How it works

```
Product facts ──▶ /api/generate ──▶ OpenAI (gpt-4o-mini, JSON mode)
                                     └─ no key? deterministic demo writer
Generated listing ──▶ /api/push ──▶ Shopify Admin API (products.json, draft)
                                     └─ no store? simulated push, same flow
```

- **All AI and Shopify calls run server-side** in Next.js route handlers — API keys never reach the browser.
- **Demo mode**: without env vars the whole flow still works end-to-end (canned copywriter + simulated store), so any visitor can try it.
- Pushed products land as **drafts** with price, product type, tags and SEO metafields set.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · framer-motion · OpenAI API · Shopify Admin REST API · Vercel

## Design

Liquid-glass aesthetic: translucent cards with backdrop blur, warm premium palette with a gold accent, ambient drifting orbs, staggered field reveal on generation. Light/dark themes, `prefers-reduced-motion` respected, WCAG-conscious contrast.

## Run locally

```bash
npm install
npm run dev   # http://localhost:3000
```

Works immediately in demo mode. For live mode create `.env.local`:

```bash
OPENAI_API_KEY=sk-...            # enables real AI copywriting
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_TOKEN=shpat_...    # Admin API token with write_products scope
```

## Why this exists

Built as a focused proof: AI copy generation with structured output + a real third-party commerce API integration (auth, error handling, draft-safe writes) — the core of every "generate listings and push them to my store" workflow.

---

Built by [Ilya Shapovalov](https://github.com/yagaMI-Reverse).

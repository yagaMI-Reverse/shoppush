import type { GeneratedListing, ProductInput } from "./types";

// Deterministic, decent-quality fallback so the studio works for any visitor
// without an OpenAI key configured. The API route decides which path to use.
export function demoListing(input: ProductInput): GeneratedListing {
  const name = input.name.trim() || "Untitled product";
  const category = input.category.trim() || "General";
  const facts = input.facts
    .split(/\r?\n|[;•]/)
    .map((f) => f.trim().replace(/^[-*]\s*/, ""))
    .filter(Boolean)
    .slice(0, 5);

  const toneLead: Record<ProductInput["tone"], string> = {
    premium: "Crafted for people who notice the difference.",
    friendly: "Made to make your day a little easier.",
    technical: "Engineered to spec, documented to the last detail.",
  };

  const bullets =
    facts.length > 0
      ? facts.map((f) => f.charAt(0).toUpperCase() + f.slice(1))
      : [
          `Quality ${category.toLowerCase()} built to last`,
          "Thoughtful design with zero filler",
          "Backed by responsive human support",
        ];

  const description = [
    `${toneLead[input.tone]} ${name} is a ${category.toLowerCase()} that earns its place — no gimmicks, just the details that matter.`,
    facts.length > 0
      ? `Here's what you get: ${facts.map((f) => f.toLowerCase().replace(/\.$/, "")).join(", ")}.`
      : "Every detail was chosen deliberately, from materials to finish.",
    "Add it to your store lineup and let the product page do the selling.",
  ].join("\n\n");

  const tagBase = [category, input.tone, ...facts.slice(0, 3)]
    .map((t) =>
      t
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .trim()
        .split(" ")
        .slice(0, 2)
        .join("-")
    )
    .filter(Boolean);

  return {
    title: `${name} — ${category}`,
    description,
    bullets,
    tags: Array.from(new Set(tagBase)).slice(0, 6),
    seoTitle: `${name} | ${category} that delivers`,
    seoDescription: `${name}: ${bullets[0].toLowerCase()}. Fast shipping, easy returns.`.slice(
      0,
      155
    ),
  };
}

export const SAMPLE_PRODUCT: ProductInput = {
  name: "Dune Ceramic Pour-Over Set",
  category: "Kitchen & Coffee",
  facts: [
    "hand-glazed stoneware in warm sand tones",
    "dripper, carafe and two cups included",
    "fits standard #2 paper filters",
    "dishwasher safe",
    "gift box made from recycled cardboard",
  ].join("\n"),
  price: "68.00",
  tone: "premium",
};

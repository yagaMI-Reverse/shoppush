import { demoListing } from "@/lib/demo";
import type { GeneratedListing, ProductInput } from "@/lib/types";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are a senior e-commerce copywriter. Given raw product facts, write a store-ready listing.
Respond with ONLY a JSON object with these exact keys:
"title" (string, max 70 chars, no quotes inside),
"description" (string, 2-3 short paragraphs separated by \\n\\n, no markdown),
"bullets" (array of 3-5 short benefit strings, no trailing periods),
"tags" (array of 4-6 lowercase kebab-case strings),
"seoTitle" (string, max 60 chars),
"seoDescription" (string, max 155 chars).
Write tight, concrete copy. Use the facts given — never invent specs that are not implied.`;

function isValidListing(value: unknown): value is GeneratedListing {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.title === "string" &&
    typeof v.description === "string" &&
    Array.isArray(v.bullets) &&
    v.bullets.every((b) => typeof b === "string") &&
    Array.isArray(v.tags) &&
    v.tags.every((t) => typeof t === "string") &&
    typeof v.seoTitle === "string" &&
    typeof v.seoDescription === "string"
  );
}

export async function POST(request: Request) {
  let input: ProductInput;
  try {
    input = (await request.json()) as ProductInput;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!input.name?.trim() && !input.facts?.trim()) {
    return Response.json(
      { error: "Give the product at least a name or a few facts." },
      { status: 400 }
    );
  }

  const userPrompt = `Product name: ${input.name}\nCategory: ${input.category}\nPrice: ${input.price}\nTone: ${input.tone}\nRaw facts:\n${input.facts}`;

  // Provider cascade: OpenAI → Gemini → deterministic demo writer.
  if (!OPENAI_API_KEY && !GEMINI_API_KEY) {
    await new Promise((r) => setTimeout(r, 1100));
    return Response.json({ mode: "demo", listing: demoListing(input) });
  }

  try {
    let raw = "";

    if (OPENAI_API_KEY) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.7,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
        }),
      });
      if (!res.ok) {
        const detail = await res.text();
        console.error("OpenAI error:", res.status, detail.slice(0, 300));
        return Response.json(
          { error: `AI provider returned ${res.status}. Try again in a moment.` },
          { status: 502 }
        );
      }
      const data = await res.json();
      raw = data.choices?.[0]?.message?.content ?? "{}";
    } else {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: "application/json",
            },
          }),
        }
      );
      if (!res.ok) {
        const detail = await res.text();
        console.error("Gemini error:", res.status, detail.slice(0, 300));
        return Response.json(
          { error: `AI provider returned ${res.status}. Try again in a moment.` },
          { status: 502 }
        );
      }
      const data = await res.json();
      raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    }

    const parsed = JSON.parse(raw);
    if (!isValidListing(parsed)) {
      return Response.json(
        { error: "AI returned an unexpected format. Try again." },
        { status: 502 }
      );
    }
    return Response.json({ mode: "live", listing: parsed });
  } catch (err) {
    console.error("Generate failed:", err);
    return Response.json(
      { error: "Generation failed. Check your connection and try again." },
      { status: 500 }
    );
  }
}

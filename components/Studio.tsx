"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Package,
  RefreshCw,
  Sparkles,
  Store,
  Tag,
  TriangleAlert,
  Wand2,
} from "lucide-react";
import { SAMPLE_PRODUCT } from "@/lib/demo";
import type {
  GeneratedListing,
  ProductInput,
  PushedProduct,
} from "@/lib/types";

const EMPTY: ProductInput = {
  name: "",
  category: "",
  facts: "",
  price: "",
  tone: "premium",
};

const TONES: { value: ProductInput["tone"]; label: string }[] = [
  { value: "premium", label: "Premium" },
  { value: "friendly", label: "Friendly" },
  { value: "technical", label: "Technical" },
];

type Phase = "idle" | "generating" | "ready" | "pushing" | "pushed";

const fieldStagger = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.35, ease: "easeOut" as const },
  }),
};

export default function Studio({
  liveAI,
  liveShopify,
}: {
  liveAI: boolean;
  liveShopify: boolean;
}) {
  const [input, setInput] = useState<ProductInput>(EMPTY);
  const [phase, setPhase] = useState<Phase>("idle");
  const [listing, setListing] = useState<GeneratedListing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shelf, setShelf] = useState<PushedProduct[]>([]);
  const [lastPush, setLastPush] = useState<PushedProduct | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("shoppush-shelf");
      if (raw) setShelf(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const saveShelf = useCallback((items: PushedProduct[]) => {
    setShelf(items);
    try {
      localStorage.setItem("shoppush-shelf", JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, []);

  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function generate() {
    if (!input.name.trim() && !input.facts.trim()) {
      setError("Give the product at least a name or a few facts.");
      return;
    }
    setError(null);
    setListing(null);
    setLastPush(null);
    setPhase("generating");
    outputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed.");
      setListing(data.listing);
      setPhase("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
      setPhase("idle");
    }
  }

  async function push() {
    if (!listing) return;
    setError(null);
    setPhase("pushing");
    try {
      const res = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing,
          price: input.price,
          category: input.category,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Push failed.");
      const pushed: PushedProduct = {
        ...data,
        price: input.price,
        category: input.category,
      };
      setLastPush(pushed);
      saveShelf([pushed, ...shelf].slice(0, 12));
      setPhase("pushed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Push failed.");
      setPhase("ready");
    }
  }

  function reset() {
    setInput(EMPTY);
    setListing(null);
    setLastPush(null);
    setError(null);
    setPhase("idle");
  }

  const busy = phase === "generating" || phase === "pushing";

  return (
    <section id="studio" className="mx-auto w-full max-w-6xl px-5 pb-28">
      {/* status strip */}
      <div className="mb-6 flex flex-wrap items-center gap-3 text-xs font-medium">
        <span className="glass flex items-center gap-2 rounded-full px-4 py-2">
          <Sparkles size={14} className="text-accent" aria-hidden />
          AI copy: {liveAI ? "live model" : "demo writer"}
        </span>
        <span className="glass flex items-center gap-2 rounded-full px-4 py-2">
          <Store size={14} className="text-accent" aria-hidden />
          Store: {liveShopify ? "Shopify dev store connected" : "demo store"}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ---- input card ---- */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="glass rounded-3xl p-6 sm:p-8"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2.5 text-lg font-semibold">
              <Package size={20} className="text-accent" aria-hidden />
              Raw product facts
            </h2>
            <button
              type="button"
              onClick={() => {
                setInput(SAMPLE_PRODUCT);
                setError(null);
              }}
              className="cursor-pointer rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-muted transition-colors duration-200 hover:border-accent hover:text-foreground"
            >
              Load sample
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Product name</span>
              <input
                value={input.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Dune Ceramic Pour-Over Set"
                className="h-11 rounded-xl border border-line bg-background/50 px-3.5 text-[15px] outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-accent"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Category</span>
                <input
                  value={input.category}
                  onChange={(e) => set("category", e.target.value)}
                  placeholder="Kitchen & Coffee"
                  className="h-11 rounded-xl border border-line bg-background/50 px-3.5 text-[15px] outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-accent"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Price (USD)</span>
                <input
                  value={input.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="68.00"
                  inputMode="decimal"
                  className="h-11 rounded-xl border border-line bg-background/50 px-3.5 text-[15px] tabular-nums outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-accent"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">
                Facts, specs, materials{" "}
                <span className="font-normal text-muted">(one per line)</span>
              </span>
              <textarea
                value={input.facts}
                onChange={(e) => set("facts", e.target.value)}
                placeholder={"hand-glazed stoneware\nfits #2 paper filters\ndishwasher safe"}
                rows={5}
                className="resize-y rounded-xl border border-line bg-background/50 px-3.5 py-3 text-[15px] leading-relaxed outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-accent"
              />
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Tone</span>
              <div className="flex gap-2" role="group" aria-label="Copy tone">
                {TONES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => set("tone", t.value)}
                    aria-pressed={input.tone === t.value}
                    className={`h-10 cursor-pointer rounded-full px-4 text-sm font-medium transition-all duration-200 ${
                      input.tone === t.value
                        ? "bg-accent text-white shadow-lg shadow-accent/25"
                        : "border border-line text-muted hover:border-accent hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={generate}
              disabled={busy}
              className="mt-2 flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent text-[15px] font-semibold text-white shadow-xl shadow-accent/25 transition-all duration-200 hover:brightness-110 active:scale-[.99] disabled:cursor-default disabled:opacity-60"
            >
              {phase === "generating" ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden />
                  Writing your listing…
                </>
              ) : (
                <>
                  <Wand2 size={18} aria-hidden />
                  Generate listing
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* ---- output card ---- */}
        <motion.div
          ref={outputRef}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
          className="glass flex flex-col rounded-3xl p-6 sm:p-8"
        >
          <h2 className="mb-6 flex items-center gap-2.5 text-lg font-semibold">
            <Store size={20} className="text-accent" aria-hidden />
            Store-ready listing
          </h2>

          {phase === "generating" && (
            <div className="flex flex-col gap-4" aria-label="Generating listing">
              <div className="shimmer h-7 w-3/4" />
              <div className="shimmer h-4 w-full" />
              <div className="shimmer h-4 w-11/12" />
              <div className="shimmer h-4 w-4/5" />
              <div className="mt-2 flex gap-2">
                <div className="shimmer h-7 w-20 rounded-full" />
                <div className="shimmer h-7 w-24 rounded-full" />
                <div className="shimmer h-7 w-16 rounded-full" />
              </div>
            </div>
          )}

          {!listing && phase === "idle" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-14 text-center">
              <div className="glass flex h-16 w-16 items-center justify-center rounded-2xl">
                <Sparkles size={26} className="text-accent" aria-hidden />
              </div>
              <p className="max-w-[26ch] text-[15px] text-muted">
                Fill in the facts on the left — the finished listing lands here.
              </p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {listing && (
              <motion.div
                key={listing.title}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-5"
              >
                <motion.div variants={fieldStagger} custom={0}>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-semibold leading-snug">
                      {listing.title}
                    </h3>
                    {input.price && (
                      <span className="whitespace-nowrap rounded-full bg-accent-soft px-3.5 py-1.5 text-sm font-semibold tabular-nums text-accent">
                        ${input.price}
                      </span>
                    )}
                  </div>
                </motion.div>

                <motion.p
                  variants={fieldStagger}
                  custom={1}
                  className="whitespace-pre-line text-[15px] leading-relaxed text-muted"
                >
                  {listing.description}
                </motion.p>

                <motion.ul
                  variants={fieldStagger}
                  custom={2}
                  className="flex flex-col gap-2"
                >
                  {listing.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-[15px]">
                      <CheckCircle2
                        size={17}
                        className="mt-0.5 shrink-0 text-accent"
                        aria-hidden
                      />
                      {b}
                    </li>
                  ))}
                </motion.ul>

                <motion.div
                  variants={fieldStagger}
                  custom={3}
                  className="flex flex-wrap gap-2"
                >
                  {listing.tags.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs font-medium text-muted"
                    >
                      <Tag size={11} aria-hidden />
                      {t}
                    </span>
                  ))}
                </motion.div>

                <motion.div
                  variants={fieldStagger}
                  custom={4}
                  className="rounded-xl border border-line bg-background/40 p-4"
                >
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                    SEO preview
                  </p>
                  <p className="text-sm font-medium text-accent">
                    {listing.seoTitle}
                  </p>
                  <p className="text-[13px] leading-relaxed text-muted">
                    {listing.seoDescription}
                  </p>
                </motion.div>

                <motion.div variants={fieldStagger} custom={5} className="mt-1 flex gap-3">
                  {phase !== "pushed" ? (
                    <button
                      type="button"
                      onClick={push}
                      disabled={busy}
                      className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-foreground text-[15px] font-semibold text-background transition-all duration-200 hover:opacity-90 active:scale-[.99] disabled:cursor-default disabled:opacity-60"
                    >
                      {phase === "pushing" ? (
                        <>
                          <Loader2 size={18} className="animate-spin" aria-hidden />
                          Pushing to store…
                        </>
                      ) : (
                        <>
                          Push to Shopify
                          <ArrowRight size={18} aria-hidden />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={reset}
                      className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line text-[15px] font-semibold transition-colors duration-200 hover:border-accent"
                    >
                      <RefreshCw size={17} aria-hidden />
                      New product
                    </button>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {lastPush && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mt-5 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent-soft p-4"
                role="status"
              >
                <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                <div className="text-sm leading-relaxed">
                  <p className="font-semibold">
                    Pushed{lastPush.mode === "demo" ? " to demo store" : " to Shopify"} ·{" "}
                    <span className="tabular-nums">id {lastPush.productId}</span>
                  </p>
                  {lastPush.adminUrl ? (
                    <a
                      href={lastPush.adminUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 font-medium text-accent underline-offset-2 hover:underline"
                    >
                      Open in Shopify admin <ExternalLink size={13} aria-hidden />
                    </a>
                  ) : (
                    <p className="text-muted">
                      Connect a dev store via env vars to push for real — the code path is identical.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm"
            >
              <TriangleAlert size={18} className="mt-0.5 shrink-0 text-red-500" aria-hidden />
              <div>
                <p className="font-medium">{error}</p>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="mt-1 cursor-pointer text-muted underline-offset-2 hover:underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ---- pushed shelf ---- */}
      {shelf.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 flex items-center gap-2.5 text-lg font-semibold">
            <Package size={20} className="text-accent" aria-hidden />
            Pushed products
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold tabular-nums text-accent">
              {shelf.length}
            </span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shelf.map((p) => (
              <motion.div
                key={p.productId}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="glass rounded-2xl p-5"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                      p.mode === "live"
                        ? "bg-accent-soft text-accent"
                        : "border border-line text-muted"
                    }`}
                  >
                    {p.mode === "live" ? "In store" : "Demo"}
                  </span>
                  {p.price && (
                    <span className="text-sm font-semibold tabular-nums">${p.price}</span>
                  )}
                </div>
                <p className="line-clamp-2 text-[15px] font-medium leading-snug">
                  {p.storefrontTitle}
                </p>
                <p className="mt-1.5 text-xs text-muted">
                  {p.category || "Uncategorized"} ·{" "}
                  {new Date(p.pushedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

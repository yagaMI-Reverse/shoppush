import { ArrowDown, Code2, Zap } from "lucide-react";
import Studio from "@/components/Studio";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  const liveAI = Boolean(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY);
  const liveShopify = Boolean(
    process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_ADMIN_TOKEN
  );

  return (
    <main>
      {/* header */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6">
        <a href="#top" className="flex items-center gap-2.5 text-lg font-bold">
          <span className="glass flex h-10 w-10 items-center justify-center rounded-xl">
            <Zap size={19} className="text-accent" aria-hidden />
          </span>
          Shop<span className="gold-text">Push</span>
        </a>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/yagaMI-Reverse"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub profile"
            className="glass flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105"
          >
            <Code2 size={18} strokeWidth={1.75} aria-hidden />
          </a>
          <ThemeToggle />
        </div>
      </header>

      {/* hero */}
      <section id="top" className="mx-auto w-full max-w-6xl px-5 pb-16 pt-14 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px] shadow-accent" aria-hidden />
            Next.js · OpenAI · Shopify Admin API
          </span>
          <h1 className="mt-7 text-balance text-4xl font-bold leading-[1.06] tracking-tight sm:text-6xl">
            Raw facts in.
            <br />
            <span className="gold-text">Store-ready listing</span> out.
          </h1>
          <p className="mx-auto mt-6 max-w-[52ch] text-pretty text-base leading-relaxed text-muted sm:text-lg">
            Paste what you know about a product — AI writes the title,
            description, bullets and SEO, then one click creates it in your
            Shopify store as a draft. No copy-pasting between tabs.
          </p>
          <div className="mt-9 flex items-center justify-center">
            <a
              href="#studio"
              className="flex h-12 items-center gap-2 rounded-xl bg-accent px-7 text-[15px] font-semibold text-white shadow-xl shadow-accent/25 transition-all duration-200 hover:brightness-110 active:scale-[.99]"
            >
              Try the studio
              <ArrowDown size={17} aria-hidden />
            </a>
          </div>
        </div>
      </section>

      <Studio liveAI={liveAI} liveShopify={liveShopify} />

      {/* footer */}
      <footer className="border-t border-line/60 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 text-sm text-muted">
          <p>
            Built by{" "}
            <a
              href="https://github.com/yagaMI-Reverse"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              Ilya Shapovalov
            </a>{" "}
            — Next.js 16 · OpenAI · Shopify Admin API
          </p>
          <p className="text-xs">
            AI calls run server-side only. Keys never reach the browser.
          </p>
        </div>
      </footer>
    </main>
  );
}

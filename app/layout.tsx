import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ShopPush — AI Product Listing Studio",
  description:
    "Turn raw product facts into a store-ready Shopify listing: AI-written title, description, bullets and SEO — pushed to your store in one click.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.theme==='dark'||(!('theme' in localStorage)&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased min-h-dvh`}>
        <div className="orb-field" aria-hidden="true">
          <div
            className="orb"
            style={{
              width: 520,
              height: 520,
              top: "-12%",
              left: "-8%",
              background:
                "radial-gradient(circle, rgba(217,164,65,.55), transparent 65%)",
            }}
          />
          <div
            className="orb"
            style={{
              width: 460,
              height: 460,
              top: "30%",
              right: "-10%",
              background:
                "radial-gradient(circle, rgba(180,83,9,.4), transparent 65%)",
              animationDelay: "-8s",
            }}
          />
          <div
            className="orb"
            style={{
              width: 420,
              height: 420,
              bottom: "-15%",
              left: "30%",
              background:
                "radial-gradient(circle, rgba(120,113,108,.35), transparent 65%)",
              animationDelay: "-16s",
            }}
          />
        </div>
        {children}
      </body>
    </html>
  );
}

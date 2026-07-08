import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RenderWitness — Live Source Verification Protocol",
  description:
    "Turn live web sources into consensus-backed proof. Submit a claim and a public URL. GenLayer validators judge whether the source supports it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <nav className="sticky top-0 z-50 border-b border-line-grid bg-obsidian/90 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
            <a
              href="/"
              className="flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-bright"
            >
              <span className="inline-block h-3 w-3 rounded-sm bg-source-blue" />
              RenderWitness
            </a>
            <div className="flex items-center gap-6 font-[family-name:var(--font-mono)] text-xs tracking-wide text-muted">
              <a href="/explore" className="transition-colors hover:text-bright">
                Explore
              </a>
              <a href="/submit" className="transition-colors hover:text-bright">
                Submit
              </a>
              <a href="/about" className="transition-colors hover:text-bright">
                About
              </a>
            </div>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line-grid py-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
            <p className="font-[family-name:var(--font-mono)] text-xs text-muted">
              RenderWitness Protocol
            </p>
            <p className="font-[family-name:var(--font-mono)] text-xs text-muted">
              Powered by GenLayer
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

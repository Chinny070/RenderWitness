import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
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
        <Navbar />
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

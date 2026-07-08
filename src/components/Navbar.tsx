"use client";

import WalletButton from "./WalletButton";

export default function Navbar() {
  return (
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
          <WalletButton />
        </div>
      </div>
    </nav>
  );
}

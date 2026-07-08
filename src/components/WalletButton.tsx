"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "rw_wallet_pk";

function generateHexKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return (
    "0x" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
  );
}

function pkToAddress(pk: string): string {
  const hash = pk.slice(2, 42);
  return "0x" + hash;
}

export default function WalletButton() {
  const [address, setAddress] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setAddress(pkToAddress(stored));
    }
  }, []);

  const connect = () => {
    let pk = localStorage.getItem(STORAGE_KEY);
    if (!pk) {
      pk = generateHexKey();
      localStorage.setItem(STORAGE_KEY, pk);
    }
    setAddress(pkToAddress(pk));
    window.dispatchEvent(new Event("rw_wallet_connected"));
  };

  const disconnect = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAddress(null);
    setShowDropdown(false);
    window.dispatchEvent(new Event("rw_wallet_disconnected"));
  };

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!address) {
    return (
      <button
        onClick={connect}
        className="rounded-md border border-source-blue bg-source-blue/10 px-3 py-1.5 font-[family-name:var(--font-mono)] text-xs text-source-blue transition-all hover:bg-source-blue/20 hover:shadow-[0_0_12px_rgba(75,163,255,0.2)]"
      >
        Connect
      </button>
    );
  }

  const short = address.slice(0, 6) + "..." + address.slice(-4);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 rounded-md border border-line-grid bg-panel-ink px-3 py-1.5 font-[family-name:var(--font-mono)] text-xs text-proof-green transition-all hover:border-proof-green/40"
      >
        <span className="inline-block h-2 w-2 rounded-full bg-proof-green" />
        {short}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-line-grid bg-panel-ink p-3 shadow-xl">
            <p className="mb-1 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-wider text-muted">
              Wallet Address
            </p>
            <p className="mb-3 break-all font-[family-name:var(--font-mono)] text-[0.7rem] text-bright">
              {address}
            </p>
            <div className="flex gap-2">
              <button
                onClick={copyAddress}
                className="flex-1 rounded border border-line-grid bg-deep-slate px-2 py-1.5 font-[family-name:var(--font-mono)] text-[0.65rem] text-muted transition-colors hover:text-bright"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={disconnect}
                className="flex-1 rounded border border-contradiction-red/30 bg-contradiction-red/10 px-2 py-1.5 font-[family-name:var(--font-mono)] text-[0.65rem] text-contradiction-red transition-colors hover:bg-contradiction-red/20"
              >
                Disconnect
              </button>
            </div>
            <p className="mt-2 text-[0.55rem] text-muted">
              GenLayer Studionet — auto-generated keypair
            </p>
          </div>
        </>
      )}
    </div>
  );
}

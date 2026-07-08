"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "rw_wallet_pk";
const MODE_KEY = "rw_wallet_mode";

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

function isValidPk(pk: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(pk);
}

export default function WalletButton() {
  const [address, setAddress] = useState<string | null>(null);
  const [walletMode, setWalletMode] = useState<"auto" | "imported">("auto");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConnectMenu, setShowConnectMenu] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importKey, setImportKey] = useState("");
  const [importError, setImportError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const mode = localStorage.getItem(MODE_KEY);
    if (stored) {
      setAddress(pkToAddress(stored));
      setWalletMode(mode === "imported" ? "imported" : "auto");
    }
  }, []);

  const connectAuto = () => {
    let pk = localStorage.getItem(STORAGE_KEY);
    if (!pk) {
      pk = generateHexKey();
    }
    localStorage.setItem(STORAGE_KEY, pk);
    localStorage.setItem(MODE_KEY, "auto");
    setAddress(pkToAddress(pk));
    setWalletMode("auto");
    setShowConnectMenu(false);
    window.dispatchEvent(new Event("rw_wallet_connected"));
  };

  const connectImported = () => {
    const trimmed = importKey.trim();
    if (!isValidPk(trimmed)) {
      setImportError("Invalid key. Must be 0x followed by 64 hex characters.");
      return;
    }
    localStorage.setItem(STORAGE_KEY, trimmed);
    localStorage.setItem(MODE_KEY, "imported");
    setAddress(pkToAddress(trimmed));
    setWalletMode("imported");
    setShowImport(false);
    setShowConnectMenu(false);
    setImportKey("");
    setImportError("");
    window.dispatchEvent(new Event("rw_wallet_connected"));
  };

  const disconnect = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(MODE_KEY);
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
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowConnectMenu(!showConnectMenu);
          }}
          className="rounded-md border border-source-blue bg-source-blue/10 px-3 py-1.5 font-[family-name:var(--font-mono)] text-xs text-source-blue transition-all hover:bg-source-blue/20 hover:shadow-[0_0_12px_rgba(75,163,255,0.2)]"
        >
          Connect
        </button>

        {showConnectMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => {
                setShowConnectMenu(false);
                setShowImport(false);
                setImportError("");
              }}
            />
            <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-line-grid bg-panel-ink p-3 shadow-xl">
              {!showImport ? (
                <>
                  <p className="mb-3 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-wider text-muted">
                    Connect Wallet
                  </p>
                  <button
                    onClick={connectAuto}
                    className="mb-2 w-full rounded border border-line-grid bg-deep-slate px-3 py-2.5 text-left transition-colors hover:border-source-blue/40"
                  >
                    <span className="block font-[family-name:var(--font-mono)] text-xs text-bright">
                      Generate New Wallet
                    </span>
                    <span className="block text-[0.6rem] text-muted">
                      Auto-create a keypair for Studionet
                    </span>
                  </button>
                  <button
                    onClick={() => setShowImport(true)}
                    className="w-full rounded border border-line-grid bg-deep-slate px-3 py-2.5 text-left transition-colors hover:border-source-blue/40"
                  >
                    <span className="block font-[family-name:var(--font-mono)] text-xs text-bright">
                      Import Private Key
                    </span>
                    <span className="block text-[0.6rem] text-muted">
                      Use your own wallet
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <p className="mb-2 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-wider text-muted">
                    Import Private Key
                  </p>
                  <input
                    type="password"
                    value={importKey}
                    onChange={(e) => {
                      setImportKey(e.target.value);
                      setImportError("");
                    }}
                    placeholder="0x..."
                    className="input-field mb-2 font-[family-name:var(--font-mono)] text-xs"
                    autoFocus
                  />
                  {importError && (
                    <p className="mb-2 text-[0.6rem] text-contradiction-red">
                      {importError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowImport(false);
                        setImportKey("");
                        setImportError("");
                      }}
                      className="flex-1 rounded border border-line-grid bg-deep-slate px-2 py-1.5 font-[family-name:var(--font-mono)] text-[0.65rem] text-muted transition-colors hover:text-bright"
                    >
                      Back
                    </button>
                    <button
                      onClick={connectImported}
                      className="flex-1 rounded bg-source-blue px-2 py-1.5 font-[family-name:var(--font-mono)] text-[0.65rem] text-white transition-colors hover:bg-source-blue/80"
                    >
                      Import
                    </button>
                  </div>
                  <p className="mt-2 text-[0.55rem] text-warning-amber">
                    Your key is stored locally and never sent to any server.
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  const short = address.slice(0, 6) + "..." + address.slice(-4);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowDropdown(!showDropdown);
        }}
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
              GenLayer Studionet —{" "}
              {walletMode === "imported" ? "imported key" : "auto-generated keypair"}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

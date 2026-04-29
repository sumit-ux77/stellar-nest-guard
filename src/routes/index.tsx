import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AtlasOwl } from "@/components/atlas/AtlasOwl";
import { SpeechBubble } from "@/components/atlas/SpeechBubble";
import { ConnectPanel } from "@/components/atlas/ConnectPanel";
import { BalanceCard } from "@/components/atlas/BalanceCard";
import { TrustlinesList } from "@/components/atlas/TrustlinesList";
import { SendSunlightDialog } from "@/components/atlas/SendSunlightDialog";
import { Gear } from "@/components/atlas/Gear";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useFreighter";
import { fetchAccount, fundTestnetAccount, NETWORK_LABEL, shortKey, type AccountSnapshot } from "@/lib/stellar";
import { Atlas } from "@/lib/atlas-voice";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: NestPage,
});

function NestPage() {
  const wallet = useWallet();
  const [account, setAccount] = useState<AccountSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [funding, setFunding] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [name, setName] = useState("partner");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("atlas:name") : null;
    if (stored) setName(stored);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem("atlas:name", name);
  }, [name]);

  const refresh = useCallback(async (key: string) => {
    setLoading(true);
    try {
      const snap = await fetchAccount(key);
      setAccount(snap);
    } catch (e) {
      toast.error("Atlas could not reach the ledger", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (wallet.publicKey) refresh(wallet.publicKey);
    else setAccount(null);
  }, [wallet.publicKey, refresh]);

  const fund = async () => {
    if (!wallet.publicKey) return;
    setFunding(true);
    try {
      await fundTestnetAccount(wallet.publicKey);
      toast.success("Friendbot dropped seeds in the nest");
      await refresh(wallet.publicKey);
    } catch (e) {
      toast.error("Friendbot refused", { description: e instanceof Error ? e.message : "?" });
    } finally {
      setFunding(false);
    }
  };

  const greeting = useMemo(() => {
    if (!wallet.publicKey || !account) return Atlas.greetStranger();
    if (!account.exists) return Atlas.unfundedAccount();
    return `${Atlas.greetOwner(name, account.xlm)} ${Atlas.trustlines(Math.max(0, account.trustlines.length - 1))}`;
  }, [wallet.publicKey, account, name]);

  const mood: "idle" | "alert" | "happy" | "thinking" =
    loading ? "thinking" : !wallet.publicKey ? "idle" : account?.exists ? "happy" : "alert";

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* starfield */}
      <div className="starfield absolute inset-0 opacity-70 pointer-events-none" />
      {/* drifting gears */}
      <Gear size={260} className="absolute -left-24 top-1/3 opacity-[0.06] animate-gear-slow pointer-events-none" />
      <Gear size={180} className="absolute right-10 bottom-10 opacity-[0.05] animate-gear pointer-events-none" />

      <header className="relative z-10 mx-auto max-w-6xl px-6 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-brass shadow-brass grid place-items-center font-display text-primary-foreground">
            A
          </div>
          <div>
            <div className="font-display text-lg leading-none text-foreground">The Atlas Archive</div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Level I · The Owl's Nest</div>
          </div>
        </div>

        {wallet.publicKey && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Connected · {NETWORK_LABEL}</div>
              <div className="font-mono text-xs text-brass">{shortKey(wallet.publicKey)}</div>
            </div>
            <Button variant="outline" size="sm" onClick={wallet.disconnect} className="border-border text-muted-foreground hover:text-brass">
              Leave perch
            </Button>
          </div>
        )}
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-10">
        {/* Hero row */}
        <section className="grid lg:grid-cols-[1fr_1.1fr] gap-8 items-center mb-12">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-5"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-brass">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Stellar Testnet
            </div>
            <h1 className="font-display text-5xl md:text-6xl leading-[1.05] text-foreground">
              A small, tidy nest
              <br />
              for your <span className="text-brass">starlight.</span>
            </h1>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Atlas is a mechanical owl with a brass monocle and a fondness for clean ledgers.
              Connect your wallet — he'll sweep the dust, count the seeds, and keep watch.
            </p>

            {!wallet.publicKey && (
              <div className="flex items-center gap-3 pt-2">
                <label className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Atlas may call you</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 20))}
                  className="bg-transparent border-b border-border focus:border-brass outline-none px-2 py-1 font-display text-brass"
                />
              </div>
            )}
          </motion.div>

          <div className="flex flex-col items-center gap-5">
            <div className="animate-float">
              <AtlasOwl mood={mood} size={220} />
            </div>
            <div className="w-full max-w-md">
              <SpeechBubble>{greeting}</SpeechBubble>
            </div>
          </div>
        </section>

        {/* Body */}
        {!wallet.publicKey ? (
          <div className="max-w-md mx-auto">
            <ConnectPanel
              installed={wallet.installed}
              connecting={wallet.connecting}
              onFreighter={wallet.connectFreighter}
              onManual={wallet.connectManual}
            />
            {wallet.error && <div className="mt-3 text-center text-xs text-destructive">{wallet.error}</div>}
          </div>
        ) : (
          <section className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
            <div className="space-y-6">
              {account ? (
                <BalanceCard account={account} onFund={fund} funding={funding} />
              ) : (
                <div className="rounded-2xl border border-border bg-card/40 p-10 text-center text-muted-foreground animate-pulse">
                  *Atlas adjusts the lens…*
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3">
                <Button
                  size="lg"
                  onClick={() => setSendOpen(true)}
                  disabled={!account?.exists}
                  className="bg-gradient-brass text-primary-foreground font-display tracking-wider shadow-brass hover:opacity-90 h-14"
                >
                  ✦ Send Sunlight
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => wallet.publicKey && refresh(wallet.publicKey)}
                  disabled={loading}
                  className="border-brass/40 text-brass hover:bg-brass/10 hover:text-brass h-14 font-display tracking-wider"
                >
                  {loading ? "Sweeping…" : "Sweep the nest"}
                </Button>
              </div>

              {wallet.source === "manual" && (
                <p className="text-[11px] text-muted-foreground italic text-center">
                  Read-only mode. Connect Freighter to sign and send.
                </p>
              )}
            </div>

            <div>{account && <TrustlinesList trustlines={account.trustlines} />}</div>
          </section>
        )}

        {/* Levels footer */}
        <section className="mt-16 grid md:grid-cols-4 gap-3 text-xs">
          {[
            { tag: "I", name: "The Owl's Nest", state: "active" },
            { tag: "II", name: "Constellation Map", state: "next" },
            { tag: "III", name: "Smart Perch", state: "next" },
            { tag: "IV", name: "Guardian's Eye", state: "next" },
          ].map((lvl) => (
            <div
              key={lvl.tag}
              className={`rounded-xl border p-3 ${lvl.state === "active" ? "border-brass/50 bg-brass/5" : "border-border bg-card/30 opacity-60"}`}
            >
              <div className="font-display text-brass">Level {lvl.tag}</div>
              <div className="text-foreground/80">{lvl.name}</div>
            </div>
          ))}
        </section>

        <footer className="mt-12 text-center text-[11px] text-muted-foreground">
          Built on Stellar Testnet · Powered by Horizon &amp; Freighter
        </footer>
      </main>

      {wallet.publicKey && account && (
        <SendSunlightDialog
          open={sendOpen}
          onOpenChange={setSendOpen}
          source={wallet.publicKey}
          canSign={wallet.source === "freighter"}
          signXDR={wallet.signXDR}
          onSent={() => wallet.publicKey && refresh(wallet.publicKey)}
        />
      )}
    </div>
  );
}

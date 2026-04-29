import { motion } from "framer-motion";
import { Gear } from "./Gear";
import { type AccountSnapshot, NETWORK_LABEL, shortKey } from "@/lib/stellar";
import { Button } from "@/components/ui/button";

type Props = {
  account: AccountSnapshot;
  onFund?: () => void;
  funding?: boolean;
};

export function BalanceCard({ account, onFund, funding }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-7 shadow-deep"
    >
      <Gear size={140} className="absolute -right-10 -top-10 opacity-15 animate-gear-slow" />
      <Gear size={80} className="absolute -right-4 top-24 opacity-10 animate-gear" />

      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        Stellar · {NETWORK_LABEL}
      </div>

      <div className="mt-3 font-mono text-xs text-muted-foreground">{shortKey(account.publicKey, 10, 10)}</div>

      <div className="mt-6">
        <div className="font-display text-xs uppercase tracking-[0.25em] text-brass/80">Nest Balance</div>
        {account.exists ? (
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-5xl text-foreground">{Number(account.xlm).toFixed(4)}</span>
            <span className="font-display text-xl text-brass">XLM</span>
          </div>
        ) : (
          <div className="mt-2">
            <div className="font-display text-3xl text-muted-foreground">— bare nest —</div>
            {onFund && (
              <Button
                onClick={onFund}
                disabled={funding}
                className="mt-4 bg-gradient-brass text-primary-foreground font-display tracking-wider shadow-brass hover:opacity-90"
              >
                {funding ? "Calling Friendbot…" : "Sprinkle Testnet Seeds (10 000 XLM)"}
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
        <div className="rounded-lg border border-border bg-background/40 px-3 py-2">
          <div className="text-muted-foreground">Trustlines</div>
          <div className="font-display text-brass text-lg">{Math.max(0, account.trustlines.length - 1)}</div>
        </div>
        <div className="rounded-lg border border-border bg-background/40 px-3 py-2">
          <div className="text-muted-foreground">Subentries</div>
          <div className="font-display text-brass text-lg">{account.subentryCount}</div>
        </div>
      </div>
    </motion.div>
  );
}

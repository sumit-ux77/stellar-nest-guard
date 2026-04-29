import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidPublicKey } from "@/lib/stellar";

type Props = {
  installed: boolean;
  connecting: boolean;
  onFreighter: () => void;
  onManual: (key: string) => void;
};

export function ConnectPanel({ installed, connecting, onFreighter, onManual }: Props) {
  const [key, setKey] = useState("");
  const valid = isValidPublicKey(key.trim());

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 shadow-deep">
      <h3 className="font-display text-lg text-brass mb-1">Open the Archive</h3>
      <p className="text-sm text-muted-foreground mb-5">
        Connect your Freighter wallet, or paste a Stellar Testnet public key to peek inside.
      </p>

      <Button
        onClick={onFreighter}
        disabled={connecting}
        className="w-full bg-gradient-brass text-primary-foreground font-display tracking-wider hover:opacity-90 shadow-brass"
        size="lg"
      >
        {connecting ? "Polishing the gears…" : installed ? "Connect Freighter" : "Install or Connect Freighter"}
      </Button>

      {!installed && (
        <a
          href="https://www.freighter.app/"
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-xs text-muted-foreground hover:text-brass underline-offset-4 hover:underline"
        >
          Don't have Freighter? Install it →
        </a>
      )}

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        OR PEEK IN DEMO MODE
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="space-y-2">
        <Input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="GABCD…XYZ (Stellar public key)"
          className="font-mono text-xs bg-input/50 border-border"
        />
        <Button
          onClick={() => valid && onManual(key.trim())}
          variant="outline"
          disabled={!valid}
          className="w-full border-brass/40 text-brass hover:bg-brass/10 hover:text-brass"
        >
          View this nest (read-only)
        </Button>
        <p className="text-[11px] text-muted-foreground">
          Try{" "}
          <button
            type="button"
            onClick={() => setKey("GCKFBEIYTKP74Q5XVKR6QMBTQA3FAGEPP5OZQVCUEAUDLWVJDQHVPGSE")}
            className="text-brass hover:underline"
          >
            a sample testnet key
          </button>
          .
        </p>
      </div>
    </div>
  );
}

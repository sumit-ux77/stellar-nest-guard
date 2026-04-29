import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpeechBubble } from "./SpeechBubble";
import { Atlas } from "@/lib/atlas-voice";
import {
  buildPaymentXDR,
  destinationStatus,
  isValidPublicKey,
  NETWORK_PASSPHRASE,
  submitSignedXDR,
} from "@/lib/stellar";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: string;
  canSign: boolean;
  signXDR: (xdr: string, network: string) => Promise<string>;
  onSent: () => void;
};

type Status = "active" | "new" | "unknown" | "idle" | "checking";

export function SendSunlightDialog({ open, onOpenChange, source, canSign, signXDR, onSent }: Props) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setDestination("");
      setAmount("");
      setMemo("");
      setStatus("idle");
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    const k = destination.trim();
    if (!k) return setStatus("idle");
    if (!isValidPublicKey(k)) return setStatus("unknown");
    setStatus("checking");
    const t = setTimeout(async () => {
      const s = await destinationStatus(k);
      setStatus(s);
    }, 350);
    return () => clearTimeout(t);
  }, [destination]);

  const amt = Number(amount);
  const validAmount = !Number.isNaN(amt) && amt > 0;
  const validDest = status === "active" || status === "new";

  const send = async () => {
    if (!canSign) {
      toast.error("Connect Freighter to sign and send.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const xdr = await buildPaymentXDR({
        source,
        destination: destination.trim(),
        amount: amount.trim(),
        memo: memo.trim() || undefined,
      });
      const signed = await signXDR(xdr, NETWORK_PASSPHRASE);
      const { hash } = await submitSignedXDR(signed);
      toast.success("Sunlight delivered ✦", { description: hash.slice(0, 16) + "…" });
      onSent();
      onOpenChange(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown failure";
      setError(msg);
      toast.error("A gear slipped", { description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const tone = status === "new" ? "warn" : status === "unknown" ? "error" : "default";
  const message =
    status === "checking"
      ? "*adjusting the lens…*"
      : status === "idle"
      ? "Whisper an address into the ear-trumpet, and an amount of sunlight to send."
      : Atlas.confirmSend(amount || "0", status === "checking" ? "active" : (status as "active" | "new" | "unknown"));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-brass tracking-wide">Send Sunlight</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <SpeechBubble tone={tone}>{message}</SpeechBubble>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Destination</Label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="GABCD…"
              className="font-mono text-xs bg-input/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Amount (XLM)</Label>
              <Input
                type="number"
                step="0.0001"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10.0000"
                className="font-mono bg-input/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Memo (optional)</Label>
              <Input
                value={memo}
                maxLength={28}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="for tea"
                className="bg-input/50"
              />
            </div>
          </div>

          {error && <div className="text-xs text-destructive">{error}</div>}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={send}
              disabled={!validAmount || !validDest || submitting || !canSign}
              className="flex-1 bg-gradient-brass text-primary-foreground font-display tracking-wider shadow-brass hover:opacity-90"
            >
              {submitting ? "Polishing the lens…" : "Send Sunlight"}
            </Button>
          </div>

          {!canSign && (
            <p className="text-[11px] text-muted-foreground italic text-center">
              Read-only mode. Connect Freighter to sign transactions.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

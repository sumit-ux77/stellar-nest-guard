/** Atlas's voice — terse, warm, faintly Victorian. */
export const Atlas = {
  greetStranger(): string {
    return "Good evening, traveller. I am Atlas, keeper of this little archive. Bring me a wallet and I shall tend to your nest.";
  },
  greetOwner(name: string, xlm: string): string {
    const n = name.trim() || "partner";
    return `Welcome back, ${n}. I have swept the dust from your perch — ${Number(xlm).toFixed(4)} XLM rests in the hollow.`;
  },
  unfundedAccount(): string {
    return "Hmm. This nest is bare — no record on the ledger yet. Shall I send the friendbot to drop a few seeds?";
  },
  trustlines(count: number): string {
    if (count === 0) return "No loose trustlines tangled in the branches. Tidy.";
    if (count === 1) return "One trustline strung between the boughs.";
    return `${count} trustlines woven through your perch.`;
  },
  confirmSend(amount: string, kind: "active" | "new" | "unknown"): string {
    if (kind === "unknown") return "That address looks malformed, partner. The lens shows only fog.";
    if (kind === "new") return `Partner, this address has no history on the ledger — a foggy path. Sending ${amount} XLM will create the account. Proceed with care.`;
    return `Let me polish the lens… yes, that address looks correct. Ready to send ${amount} XLM?`;
  },
  success(): string {
    return "Sunlight delivered. *cleans feathers with a small cloth* — the ledger hums approval.";
  },
  failure(msg: string): string {
    return `A gear has slipped: ${msg}. Take a breath; we may try again.`;
  },
};

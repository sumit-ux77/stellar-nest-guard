import { type Trustline, shortKey } from "@/lib/stellar";

export function TrustlinesList({ trustlines }: { trustlines: Trustline[] }) {
  const nonNative = trustlines.filter((t) => !t.isNative);
  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 shadow-deep">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-brass">Loose Trustlines</h3>
        <span className="text-xs text-muted-foreground">{nonNative.length} bound</span>
      </div>
      {nonNative.length === 0 ? (
        <div className="text-sm text-muted-foreground italic">
          The branches are clear. No additional assets bound to this nest.
        </div>
      ) : (
        <ul className="space-y-2">
          {nonNative.map((t, i) => (
            <li
              key={`${t.code}-${t.issuer}-${i}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5"
            >
              <div>
                <div className="font-display text-brass text-sm">{t.code}</div>
                <div className="font-mono text-[10px] text-muted-foreground">{shortKey(t.issuer ?? "", 8, 8)}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm">{Number(t.balance).toFixed(4)}</div>
                <div className="text-[10px] text-muted-foreground">balance</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

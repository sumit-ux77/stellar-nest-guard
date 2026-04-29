import { Horizon, Asset, TransactionBuilder, Networks, Operation, BASE_FEE, StrKey } from "@stellar/stellar-sdk";

export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const NETWORK_LABEL = "Testnet";

export const horizon = new Horizon.Server(HORIZON_URL);

export type Trustline = {
  code: string;
  issuer?: string;
  balance: string;
  limit?: string;
  isNative: boolean;
};

export type AccountSnapshot = {
  publicKey: string;
  exists: boolean;
  xlm: string;
  trustlines: Trustline[];
  subentryCount: number;
};

export function isValidPublicKey(key: string): boolean {
  try {
    return StrKey.isValidEd25519PublicKey(key);
  } catch {
    return false;
  }
}

export function shortKey(key: string, head = 6, tail = 6): string {
  if (!key) return "";
  if (key.length <= head + tail + 3) return key;
  return `${key.slice(0, head)}…${key.slice(-tail)}`;
}

export async function fetchAccount(publicKey: string): Promise<AccountSnapshot> {
  try {
    const acc = await horizon.loadAccount(publicKey);
    const trustlines: Trustline[] = acc.balances.map((b) => {
      if (b.asset_type === "native") {
        return { code: "XLM", balance: b.balance, isNative: true };
      }
      const anyB = b as { asset_code?: string; asset_issuer?: string; balance: string; limit?: string };
      return {
        code: anyB.asset_code ?? "?",
        issuer: anyB.asset_issuer,
        balance: anyB.balance,
        limit: anyB.limit,
        isNative: false,
      };
    });
    const xlm = trustlines.find((t) => t.isNative)?.balance ?? "0";
    return {
      publicKey,
      exists: true,
      xlm,
      trustlines,
      subentryCount: acc.subentry_count,
    };
  } catch (err: unknown) {
    const e = err as { response?: { status?: number } };
    if (e?.response?.status === 404) {
      return { publicKey, exists: false, xlm: "0", trustlines: [], subentryCount: 0 };
    }
    throw err;
  }
}

export async function fundTestnetAccount(publicKey: string): Promise<void> {
  const url = `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Friendbot funding failed");
}

/**
 * Build a payment XDR. Caller signs with Freighter then submits via Horizon.
 */
export async function buildPaymentXDR(opts: {
  source: string;
  destination: string;
  amount: string; // in XLM
  memo?: string;
}): Promise<string> {
  const account = await horizon.loadAccount(opts.source);
  const builder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  }).addOperation(
    Operation.payment({
      destination: opts.destination,
      asset: Asset.native(),
      amount: opts.amount,
    }),
  );
  if (opts.memo) {
    const { Memo } = await import("@stellar/stellar-sdk");
    builder.addMemo(Memo.text(opts.memo.slice(0, 28)));
  }
  const tx = builder.setTimeout(120).build();
  return tx.toXDR();
}

export async function destinationStatus(destination: string): Promise<"unknown" | "new" | "active"> {
  if (!isValidPublicKey(destination)) return "unknown";
  try {
    const acc = await horizon.loadAccount(destination);
    return acc ? "active" : "new";
  } catch (err: unknown) {
    const e = err as { response?: { status?: number } };
    if (e?.response?.status === 404) return "new";
    return "unknown";
  }
}

export async function submitSignedXDR(signedXDR: string): Promise<{ hash: string }> {
  const tx = TransactionBuilder.fromXDR(signedXDR, NETWORK_PASSPHRASE);
  const result = await horizon.submitTransaction(tx);
  return { hash: result.hash };
}

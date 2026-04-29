import { useCallback, useEffect, useState } from "react";

type FreighterApi = {
  isConnected: () => Promise<boolean | { isConnected: boolean }>;
  isAllowed?: () => Promise<boolean | { isAllowed: boolean }>;
  setAllowed?: () => Promise<unknown>;
  requestAccess?: () => Promise<{ address?: string; error?: string }>;
  getAddress?: () => Promise<{ address?: string; error?: string }>;
  getPublicKey?: () => Promise<string>;
  signTransaction: (
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string },
  ) => Promise<string | { signedTxXdr?: string; signedXDR?: string; error?: string }>;
};

export type WalletState = {
  publicKey: string | null;
  source: "freighter" | "manual" | null;
  installed: boolean;
  connecting: boolean;
  error: string | null;
};

const initial: WalletState = {
  publicKey: null,
  source: null,
  installed: false,
  connecting: false,
  error: null,
};

async function loadFreighter(): Promise<FreighterApi | null> {
  try {
    const mod = await import("@stellar/freighter-api");
    return mod as unknown as FreighterApi;
  } catch {
    return null;
  }
}

export function useWallet() {
  const [state, setState] = useState<WalletState>(initial);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const api = await loadFreighter();
      if (cancelled) return;
      if (!api) return setState((s) => ({ ...s, installed: false }));
      try {
        const res = await api.isConnected();
        const installed = typeof res === "boolean" ? res : !!res?.isConnected;
        setState((s) => ({ ...s, installed }));
      } catch {
        setState((s) => ({ ...s, installed: false }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const connectFreighter = useCallback(async () => {
    setState((s) => ({ ...s, connecting: true, error: null }));
    const api = await loadFreighter();
    if (!api) {
      setState((s) => ({ ...s, connecting: false, error: "Freighter not installed" }));
      return null;
    }
    try {
      let address: string | undefined;
      if (api.requestAccess) {
        const r = await api.requestAccess();
        if (r?.error) throw new Error(r.error);
        address = r?.address;
      } else if (api.getAddress) {
        const r = await api.getAddress();
        address = r?.address;
      } else if (api.getPublicKey) {
        address = await api.getPublicKey();
      }
      if (!address) throw new Error("No address returned by Freighter");
      setState({ publicKey: address, source: "freighter", installed: true, connecting: false, error: null });
      return address;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to connect";
      setState((s) => ({ ...s, connecting: false, error: msg }));
      return null;
    }
  }, []);

  const connectManual = useCallback((publicKey: string) => {
    setState({ publicKey, source: "manual", installed: state.installed, connecting: false, error: null });
  }, [state.installed]);

  const disconnect = useCallback(() => {
    setState({ ...initial, installed: state.installed });
  }, [state.installed]);

  const signXDR = useCallback(async (xdr: string, networkPassphrase: string) => {
    if (state.source !== "freighter" || !state.publicKey) {
      throw new Error("Demo (read-only) wallet cannot sign. Connect Freighter to send.");
    }
    const api = await loadFreighter();
    if (!api) throw new Error("Freighter not available");
    const res = await api.signTransaction(xdr, { networkPassphrase, address: state.publicKey });
    if (typeof res === "string") return res;
    if (res?.error) throw new Error(res.error);
    const signed = res?.signedTxXdr ?? res?.signedXDR;
    if (!signed) throw new Error("Freighter returned no signed XDR");
    return signed;
  }, [state.source, state.publicKey]);

  return { ...state, connectFreighter, connectManual, disconnect, signXDR };
}

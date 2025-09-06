// app/providers.tsx
"use client";

import React, { ReactNode, useMemo } from "react";
import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { mainnet } from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

/**
 * Use a jsonRpcProvider with an explicit RPC URL to avoid publicProvider runtime issues.
 * This runs only on the client (use client) and is memoized.
 */
export default function Providers({ children }: { children: ReactNode }) {
  const wagmiClient = useMemo(() => {
    const { chains, publicClient } = configureChains(
      [mainnet],
      [
        jsonRpcProvider({
          rpc: (chain) => {
            if (chain.id === mainnet.id) {
              // stable public HTTP RPC for Ethereum mainnet
              return { http: "https://cloudflare-eth.com" };
            }
            // fallback (shouldn't be hit for our single-chain app)
            return {
              http:
                chain.rpcUrls?.default?.http?.[0] ??
                "https://cloudflare-eth.com",
            };
          },
        }),
      ]
    );

    return createConfig({
      autoConnect: true,
      connectors: [
        new InjectedConnector({ chains }),
        new WalletConnectConnector({
          chains,
          options: { projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "" },
        }),
      ],
      publicClient,
    });
  }, []);

  return <WagmiConfig config={wagmiClient}>{children}</WagmiConfig>;
}

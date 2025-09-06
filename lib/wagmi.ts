// lib/wagmi.ts
import { configureChains, createConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

const { chains, publicClient } = configureChains(
  [mainnet],
  // publicProvider is a function you must call
  [publicProvider()]
);

export const wagmiClient = createConfig({
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

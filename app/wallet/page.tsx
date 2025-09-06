"use client";
import React from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import Button from "../../components/Button";

export default function WalletPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div className="bg-white shadow-sm rounded-xl p-6 border border-slate-200 max-w-lg mx-aut lg:mt-32">
      <h2 className="text-lg font-semibold mb-4">Wallet</h2>

      {isConnected ? (
        <div className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-md text-sm">
            <span className="font-medium">Address:</span>{" "}
            <span className="font-mono break-all">{address}</span>
          </div>
          <Button onClick={() => disconnect()}>Disconnect</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Connect a wallet to enable the Order form.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => connect({ connector: new InjectedConnector() })}
            >
              Connect MetaMask
            </Button>
            <Button
              onClick={() =>
                connect({
                  connector: new WalletConnectConnector({
                    options: {
                      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "",
                    },
                  }),
                })
              }
            >
              Connect WalletConnect
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import React, { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";

type OrderResp = {
  order_id: string;
  status: string;
  amount: number;
  currency: string;
  token: string;
  created_at: string;
};

// Fix hydration error: render address only after mount
function WalletInfo() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className="text-sm text-slate-500">loading…</span>;
  return (
    <span className="font-medium">
      {isConnected ? address : "not connected"}
    </span>
  );
}

export default function OrderPage() {
  const { isConnected } = useAccount();
  const [amount, setAmount] = useState<number>(1500);
  const [currency, setCurrency] = useState("KES");
  const [token, setToken] = useState("USDC");
  const [note, setNote] = useState("");
  const [order, setOrder] = useState<OrderResp | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finalized = useRef(false);
  const esRef = useRef<EventSource | null>(null);
  const pollRef = useRef<number | null>(null);

  async function createOrder() {
    setError(null);
    setProcessing(true);
    finalized.current = false;
    try {
      const res = await fetch("/api/mock/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency, token, note }),
      });
      if (!res.ok) throw new Error("create failed");
      const data = await res.json();
      setOrder(data);
      startListeners(data.order_id);
    } catch (e: any) {
      setError(String(e.message || e));
      setProcessing(false);
    }
  }

  function finalize(status: string) {
    if (finalized.current) return;
    if (status === "settled" || status === "failed") {
      finalized.current = true;
      setOrder((prev) => (prev ? { ...prev, status } : prev));
      cleanup();
    } else {
      setOrder((prev) => (prev ? { ...prev, status } : prev));
    }
  }

  function cleanup() {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    setProcessing(false);
  }

  function startListeners(orderId: string) {
    const startedAt = Date.now();

    async function poll() {
      try {
        const res = await fetch(`/api/mock/orders/${orderId}`);
        if (!res.ok) return;
        const d = await res.json();
        if (d.status === "settled" || d.status === "failed") {
          finalize(d.status);
        } else {
          finalize(d.status);
          if (Date.now() - startedAt >= 60_000) {
            cleanup();
            setError("Timed out – try again");
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    poll();
    pollRef.current = window.setInterval(poll, 3000);

    const es = new EventSource(`/api/mock/orders/${orderId}/stream`);
    esRef.current = es;
    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        if (payload?.data?.status) {
          finalize(payload.data.status);
        }
      } catch (e) {
        console.error("sse parse", e);
      }
    };
  }

  function retry() {
    setOrder(null);
    setError(null);
    finalized.current = false;
    setProcessing(false);
  }

  const statusColor = (s?: string) => {
    if (!s) return "gray";
    if (s === "settled") return "green";
    if (s === "failed") return "red";
    if (s === "processing") return "yellow";
    return "gray";
  };

  return (
    <div className="max-w-2xl mx-aut lg:mt-32">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Create Order</h2>
        <div className="text-sm text-slate-600">
          Wallet: <WalletInfo />
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createOrder();
        }}
        className="space-y-6 relative bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={1}
              disabled={!isConnected || processing}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Currency
            </label>
            <input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={!isConnected || processing}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Token
            </label>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={!isConnected || processing}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Note
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={!isConnected || processing}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={!isConnected || processing}>
            {processing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Processing
              </span>
            ) : (
              "Create Order"
            )}
          </Button>
          {!isConnected && (
            <span className="text-sm text-slate-500">
              Connect a wallet to enable
            </span>
          )}
        </div>
      </form>

      {/* Order details */}
      {order && (
        <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase text-slate-500">Order ID</div>
              <div className="font-mono text-sm">{order.order_id}</div>
            </div>
            <Badge color={statusColor(order.status)}>{order.status}</Badge>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
            <dt className="text-slate-500">Amount</dt>
            <dd className="font-medium">
              {order.amount} {order.currency}
            </dd>
            <dt className="text-slate-500">Token</dt>
            <dd className="font-medium">{order.token}</dd>
            <dt className="text-slate-500">Created</dt>
            <dd className="font-medium">
              {new Date(order.created_at).toLocaleString()}
            </dd>
          </dl>
        </div>
      )}

      {/* Modal while processing */}
      {processing && (
        <Modal>
          <div className="flex items-center gap-3">
            <span className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
            <div>
              <div className="font-semibold">Processing</div>
              <div className="text-sm text-slate-600">
                Waiting for settlement... (polling + webhook)
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="text-sm">{error}</p>
          <div className="mt-3">
            <Button onClick={retry}>Retry</Button>
          </div>
        </div>
      )}
    </div>
  );
}

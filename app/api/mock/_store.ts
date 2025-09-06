import { OrderRecord } from "@/lib/types";

export const orders = new Map<string, OrderRecord>();

type SendFn = (payload: string) => void;
export const subscribers = new Map<string, Set<SendFn>>();

export function notifySubscribers(orderId: string, data: any) {
  const set = subscribers.get(orderId);
  if (!set) return;
  const payload = JSON.stringify(data);
  for (const send of set) {
    try {
      send(payload);
    } catch (e) {
      // ignore
    }
  }
}

export function addSubscriber(orderId: string, send: SendFn) {
  const set = subscribers.get(orderId) ?? new Set<SendFn>();
  set.add(send);
  subscribers.set(orderId, set);
  return () => {
    const s = subscribers.get(orderId);
    if (!s) return;
    s.delete(send);
    if (s.size === 0) subscribers.delete(orderId);
  };
}

export function computeStatusForOrder(
  order: OrderRecord
): OrderRecord["status"] {
  const ageSec = Math.floor((Date.now() - order.createdTs) / 1000);
  if (ageSec <= 7) return "created";
  if (ageSec <= 17) return "processing";
  if (order.status === "settled" || order.status === "failed")
    return order.status;
  // pseudo-random deterministic choice to make tests reproducible
  const seed = parseInt(order.order_id.replace(/\D/g, "").slice(-6) || "0", 10);
  const rand = (seed + ageSec) % 100;
  return rand < 80 ? "settled" : "failed";
}

import { NextResponse } from "next/server";
import { orders } from "../../_store";
import { v4 as uuidv4 } from "uuid";
import type { OrderRecord } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json();
  const { amount, currency, token, note } = body;
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
  }
  const order_id = `ord_${uuidv4().replace(/-/g, "").slice(0, 20)}`;
  const created_at = new Date().toISOString();
  const createdTs = Date.now();
  const order: OrderRecord = {
    order_id,
    status: "created",
    amount,
    currency,
    token,
    note,
    created_at,
    createdTs,
  };
  orders.set(order_id, order);
  return NextResponse.json({
    order_id,
    status: "created",
    amount,
    currency,
    token,
    created_at,
  });
}

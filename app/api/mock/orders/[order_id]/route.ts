import { NextResponse } from 'next/server';
import { orders, computeStatusForOrder } from '../../_store';

export async function GET(req: Request, { params }: { params: { order_id: string } }) {
  const { order_id } = params;
  const order = orders.get(order_id);
  if (!order) {
    return NextResponse.json({ error: 'order_not_found', message: `No order with id ${order_id}` }, { status: 404 });
  }
  const derived = computeStatusForOrder(order);
  if ((derived === 'settled' || derived === 'failed') && order.status !== derived) {
    order.status = derived;
    orders.set(order_id, order);
  } else {
    order.status = derived;
  }
  return NextResponse.json({
    order_id: order.order_id,
    status: order.status,
    amount: order.amount,
    currency: order.currency,
    token: order.token,
    created_at: order.created_at,
  });
}

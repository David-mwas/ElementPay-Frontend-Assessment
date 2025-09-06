import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { orders, notifySubscribers } from '@/app/api/mock/_store';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'shh_super_secret';

function parseSignatureHeader(header: string | null) {
  if (!header) return null;
  const parts = header.split(',').map(p => p.trim());
  const map: Record<string, string> = {};
  for (const p of parts) {
    const [k, v] = p.split('=');
    if (k && v) map[k] = v;
  }
  return map;
}

function timingSafeCompare(a: Buffer, b: Buffer) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const raw = await req.text();
  const sigHeader = req.headers.get('x-webhook-signature');
  const parsed = parseSignatureHeader(sigHeader);
  if (!parsed || !parsed.t || !parsed.v1) {
    return NextResponse.json({ error: 'invalid_signature_header' }, { status: 400 });
  }

  const t = parseInt(parsed.t, 10);
  if (Number.isNaN(t)) return NextResponse.json({ error: 'invalid_timestamp' }, { status: 400 });

  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - t) > 300) {
    return NextResponse.json({ error: 'timestamp_expired' }, { status: 403 });
  }

  const payload = `${parsed.t}.${raw}`;
  const computed = crypto.createHmac('sha256', WEBHOOK_SECRET).update(payload).digest('base64');

  const ok = timingSafeCompare(Buffer.from(computed, 'utf-8'), Buffer.from(parsed.v1, 'utf-8'));
  if (!ok) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }

  let body: any;
  try {
    body = JSON.parse(raw);
  } catch (e) {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { type, data } = body;
  if (!data || !data.order_id || !data.status) {
    return NextResponse.json({ error: 'invalid_event' }, { status: 400 });
  }

  const order = orders.get(data.order_id);
  if (!order) {
    return NextResponse.json({ error: 'order_not_found' }, { status: 404 });
  }

  const newStatus = data.status;
  if (order.status === 'settled' || order.status === 'failed') {
    return NextResponse.json({ ok: true });
  }

  order.status = newStatus;
  orders.set(order.order_id, order);

  notifySubscribers(order.order_id, { type, data: { order_id: order.order_id, status: order.status } });

  return NextResponse.json({ ok: true });
}

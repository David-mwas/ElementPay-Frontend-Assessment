import crypto from 'crypto';

function computeSignature(secret: string, t: number, raw: string) {
  const payload = `${t}.${raw}`;
  return crypto.createHmac('sha256', secret).update(payload).digest('base64');
}

test('test vector from spec - valid', () => {
  const secret = 'shh_super_secret';
  const t = 1710000000;
  const raw = '{"type":"order.settled","data":{"order_id":"ord_0xabc123","status":"settled"}}';
  const v1 = '3QXTcQv0m0h4QkQ0L0w9ZsH1YFhZgMGnF0d9Xz4P7nQ=';
  const computed = computeSignature(secret, t, raw);
  expect(computed).toBe(v1);
});

test('invalid signature mismatch', () => {
  const secret = 'shh_super_secret';
  const t = 1710000300;
  const raw = '{"type":"order.failed","data":{"order_id":"ord_0xabc123","status":"failed"}}';
  const v1 = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
  const computed = computeSignature(secret, t, raw);
  expect(computed).not.toBe(v1);
});

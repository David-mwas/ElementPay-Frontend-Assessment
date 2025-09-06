export type OrderStatus = 'created' | 'processing' | 'settled' | 'failed';

export interface OrderRecord {
  order_id: string;
  status: OrderStatus;
  amount: number;
  currency: string;
  token: string;
  note?: string;
  created_at: string;
  createdTs: number;
}

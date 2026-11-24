export interface OrderItem {
  sku: string;
  name: string;
  qty: number;
  unitPrice: number;
}

export interface OrderRecord {
  id: string;
  customer: string;
  email: string;
  status: 'Paid' | 'Shipped' | 'Processing';
  date: string;
  address: string;
  items: OrderItem[];
}

export const MOCK_ORDERS: OrderRecord[] = [
  {
    id: 'ORD-8421',
    customer: 'Elena Vance',
    email: 'elena@acme.io',
    status: 'Shipped',
    date: 'Nov 22, 2026',
    address: '742 Evergreen Terrace, Austin, TX 78701',
    items: [
      { sku: 'RD-PRO-01', name: 'Enterprise Analytics Seat (Annual)', qty: 4, unitPrice: 240 },
      { sku: 'RD-SUP-02', name: 'Priority SLA Add-on', qty: 1, unitPrice: 180 },
    ],
  },
  {
    id: 'ORD-8420',
    customer: 'Marcus Chen',
    email: 'm.chen@orbit.dev',
    status: 'Paid',
    date: 'Nov 21, 2026',
    address: '1200 Market St, San Francisco, CA 94102',
    items: [{ sku: 'RD-TEAM-01', name: 'Team Workspace License', qty: 2, unitPrice: 149 }],
  },
];

export async function listOrders(): Promise<OrderRecord[]> {
  return MOCK_ORDERS;
}

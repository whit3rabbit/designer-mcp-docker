import type { AnalyticsSnapshot } from '../features/analytics/analyticsRepository';

export const ANALYTICS_FAKE_DB: AnalyticsSnapshot = {
  kpis: [
    { id: 'mrr', label: 'Monthly Recurring Revenue', value: '$148,920', delta: '+14.2%', tone: 'primary' },
    { id: 'users', label: 'Active Workspaces', value: '8,412', delta: '+9.1%', tone: 'success' },
    { id: 'churn', label: 'Net Churn Rate', value: '1.38%', delta: '-0.4%', tone: 'info' },
    { id: 'latency', label: 'P95 API Latency', value: '112ms', delta: '-18ms', tone: 'warning' },
  ],
  revenueSeries: [
    { name: 'MRR', data: [92, 98, 105, 114, 121, 128, 136, 148] },
    { name: 'Expansion', data: [18, 21, 24, 27, 29, 34, 38, 42] },
  ],
  channelMix: [
    { label: 'Organic Search', value: 42 },
    { label: 'Direct', value: 28 },
    { label: 'Partner Referral', value: 19 },
    { label: 'Paid Acquisition', value: 11 },
  ],
  recentAccounts: [
    { id: 'acc-1', account: 'Northstar Logistics', plan: 'Enterprise', mrr: '$12,400', status: 'Active' },
    { id: 'acc-2', account: 'Vanguard Health', plan: 'Growth', mrr: '$4,200', status: 'Active' },
    { id: 'acc-3', account: 'Cinder Labs', plan: 'Scale', mrr: '$6,800', status: 'Trial' },
    { id: 'acc-4', account: 'Helios Energy', plan: 'Enterprise', mrr: '$15,100', status: 'Active' },
  ],
};

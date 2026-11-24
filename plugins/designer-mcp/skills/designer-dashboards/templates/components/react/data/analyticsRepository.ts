export interface PageMetric {
  id: string;
  path: string;
  views: number;
  conversionRate: number;
  revenue: number;
}

export interface AnalyticsSnapshot {
  kpis: {
    activeUsers: number;
    sessions: number;
    bounceRate: number;
    revenue30d: number;
  };
  trafficSeries: {
    categories: string[];
    sessions: number[];
    signups: number[];
  };
  devices: {
    labels: string[];
    shares: number[];
  };
  topPages: PageMetric[];
}

const MOCK_SNAPSHOT: AnalyticsSnapshot = {
  kpis: {
    activeUsers: 48290,
    sessions: 129400,
    bounceRate: 31.4,
    revenue30d: 171480,
  },
  trafficSeries: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    sessions: [42, 51, 49, 64, 71, 68, 84],
    signups: [14, 19, 17, 25, 29, 27, 36],
  },
  devices: {
    labels: ['Desktop', 'Mobile', 'Tablet'],
    shares: [62, 31, 7],
  },
  topPages: [
    { id: '1', path: '/pricing', views: 28410, conversionRate: 4.8, revenue: 64200 },
    { id: '2', path: '/features/analytics', views: 19320, conversionRate: 3.4, revenue: 41850 },
    { id: '3', path: '/docs/quickstart', views: 15840, conversionRate: 2.9, revenue: 28400 },
    { id: '4', path: '/blog/design-tokens', views: 12190, conversionRate: 2.1, revenue: 14920 },
    { id: '5', path: '/integrations', views: 9870, conversionRate: 3.9, revenue: 22110 },
  ],
};

/**
 * Production-shaped data repository.
 * Swap to your real REST/GraphQL/Server Action endpoint when DATA_MODE=live.
 */
export async function fetchAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  return MOCK_SNAPSHOT;
}

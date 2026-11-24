import * as React from 'react';
import { AnalyticsDashboard } from '../../../../../features/analytics/AnalyticsDashboard';
import { getAnalyticsFromServer } from '../../../../server/actions';

export default async function AnalyticsPage() {
  await getAnalyticsFromServer();
  return (
    <React.Suspense fallback={<div className="p-6 text-sm text-[var(--color-text-muted)]">Loading analytics...</div>}>
      <AnalyticsDashboard />
    </React.Suspense>
  );
}

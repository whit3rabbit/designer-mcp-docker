'use server';

import { ANALYTICS_FAKE_DB } from '../../fake-db/analytics';
import type { AnalyticsSnapshot } from '../../features/analytics/analyticsRepository';

/**
 * Server-first data accessor reading typed fake-db fixtures (or Prisma/DB in live mode).
 * Called directly from async Server Components without client fetch waterfalls.
 */
export async function getAnalyticsFromServer(): Promise<AnalyticsSnapshot> {
  return ANALYTICS_FAKE_DB;
}

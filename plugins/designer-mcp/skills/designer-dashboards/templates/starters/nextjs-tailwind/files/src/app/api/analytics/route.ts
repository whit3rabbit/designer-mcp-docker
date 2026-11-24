import { NextResponse } from 'next/server';
import { ANALYTICS_FAKE_DB } from '../../../fake-db/analytics';

export async function GET() {
  return NextResponse.json({
    status: 200,
    msg: 'ok',
    data: ANALYTICS_FAKE_DB,
  });
}

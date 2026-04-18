import { NextResponse } from 'next/server';
import { container } from '@/core/container';
import { withAuth } from '@/core/http/with-auth';

export const dashboardController = {
  stats: withAuth({ action: 'dashboard.read' }, async (req) => {
    const url = new URL(req.url);
    const daysRaw = url.searchParams.get('days');
    const days = daysRaw ? Math.max(1, Math.min(365, Number(daysRaw))) : 30;
    return NextResponse.json(await container.dashboard.getStats(days));
  }),
};

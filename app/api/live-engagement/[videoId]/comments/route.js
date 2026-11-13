import { liveEngagementProxy } from '@/lib/liveEngagement.server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const proxy = (request, context) => liveEngagementProxy(request, context, true);
export { proxy as GET, proxy as POST };

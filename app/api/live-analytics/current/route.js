import { liveAudienceProxy } from '@/lib/liveAudience.server';
export const dynamic = 'force-dynamic';
export function GET(request) { return liveAudienceProxy(request); }

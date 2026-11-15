import { liveAudienceProxy } from '@/lib/liveAudience.server';
export const dynamic = 'force-dynamic';
export function POST(request) { return liveAudienceProxy(request,true); }

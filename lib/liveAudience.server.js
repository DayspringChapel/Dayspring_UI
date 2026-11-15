import { NextResponse } from 'next/server';
import { backendFetch, cookieSettings, isTrustedOrigin, privateHeaders } from '@/lib/session.server';
const COOKIE = process.env.NODE_ENV === 'production' ? '__Host-dayspring_viewer' : 'dayspring_viewer';
export async function liveAudienceProxy(request, heartbeat = false) {
    if (heartbeat && !isTrustedOrigin(request)) return NextResponse.json({ message:'Invalid request origin.' }, {status:403,headers:privateHeaders});
    const existing = request.cookies.get(COOKIE)?.value;
    const viewer = /^[a-f0-9]{32}$/.test(existing || '') ? existing : crypto.randomUUID().replaceAll('-','');
    try {
        let body, path;
        if (heartbeat) {
            if (Number(request.headers.get('content-length')) > 4096) throw new SyntaxError();
            const raw = await request.text(); if (new TextEncoder().encode(raw).length > 4096) throw new SyntaxError();
            const value = JSON.parse(raw);
            if (!['youtube','facebook','instagram'].includes(value.platform) || typeof value.sourceUrl !== 'string' || value.sourceUrl.length > 2048 || !/^[a-f0-9]{32}$/.test(value.sessionId || '') || !Number.isSafeInteger(value.sequence) || value.sequence < 1 || value.sequence > 1e9 || !['page','playing','paused','buffering','ended','error','hidden','left','outbound'].includes(value.state) || !['mobile','tablet','desktop'].includes(value.device) || !['direct','website','external'].includes(value.referrer)) throw new SyntaxError();
            body = JSON.stringify({platform:value.platform,sourceUrl:value.sourceUrl,sessionId:value.sessionId,sequence:value.sequence,state:value.state,device:value.device,referrer:value.referrer});
            path = '/api/v1/live-analytics/heartbeat';
        } else {
            const query = new URL(request.url).searchParams;
            if (!['youtube','facebook','instagram'].includes(query.get('platform')) || !query.get('sourceUrl') || query.get('sourceUrl').length > 2048) throw new SyntaxError();
            path = `/api/v1/live-analytics/current?${new URLSearchParams({platform:query.get('platform'),sourceUrl:query.get('sourceUrl')})}`;
        }
        const response = await backendFetch(path,{method:heartbeat?'POST':'GET',headers:{'Content-Type':'application/json','X-Dayspring-Viewer':viewer},body,signal:AbortSignal.timeout(10000)});
        const result = NextResponse.json(await response.json(),{status:response.status,headers:privateHeaders});
        if (heartbeat && viewer !== existing) result.cookies.set(COOKIE,viewer,{...cookieSettings(),maxAge:31536000});
        return result;
    } catch(error) {
        return NextResponse.json({message:error instanceof SyntaxError?'Invalid audience update.':'Audience statistics are temporarily unavailable.'},{status:error instanceof SyntaxError?400:503,headers:privateHeaders});
    }
}

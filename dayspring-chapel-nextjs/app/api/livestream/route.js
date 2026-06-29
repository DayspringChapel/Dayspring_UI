import { getStreams, setStreams } from '@/lib/livestreamStore';

export async function GET() {
    return Response.json(getStreams());
}

export async function POST(request) {
    try {
        const body = await request.json();
        return Response.json(setStreams(body));
    } catch {
        return Response.json({ error: 'Invalid body' }, { status: 400 });
    }
}

import { getChatConfig, setChatConfig } from '@/lib/chatbotConfigStore';

export async function GET() {
    return Response.json(getChatConfig());
}

export async function POST(request) {
    const body = await request.json();
    return Response.json(setChatConfig(body));
}

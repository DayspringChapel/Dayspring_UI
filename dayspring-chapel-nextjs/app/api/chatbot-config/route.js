import { getChatConfig, setChatConfig } from '@/lib/chatbotConfigStore';
import { hasServerPermission } from '@/lib/serverApi';

export async function GET() {
    return Response.json(getChatConfig());
}

export async function POST(request) {
    if (!(await hasServerPermission(request, 'CanManageChatbot'))) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await request.json();
    return Response.json(setChatConfig(body));
}

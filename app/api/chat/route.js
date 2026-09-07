import { getChatConfig } from '@/lib/chatbotConfigStore';
import { getReply } from '@/lib/chatbotEngine';

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request) {
    try {
        const { messages } = await request.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return Response.json({ error: 'Invalid messages' }, { status: 400 });
        }

        const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
        const { additionalInfo } = getChatConfig();
        const reply = getReply(lastUserMessage?.content ?? '', { adminInfo: additionalInfo });

        const encoder = new TextEncoder();
        const words = reply.split(/(\s+)/); // keep whitespace tokens so join is exact

        const readable = new ReadableStream({
            async start(controller) {
                for (const word of words) {
                    controller.enqueue(encoder.encode(word));
                    if (word.trim()) await sleep(18);
                }
                controller.close();
            },
        });

        return new Response(readable, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    } catch (err) {
        console.error('Chat API error:', err);
        return Response.json({ error: 'Failed to get response' }, { status: 500 });
    }
}

import Anthropic from '@anthropic-ai/sdk';
import { getChatConfig } from '@/lib/chatbotConfigStore';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the friendly virtual assistant for Dayspring Chapel, a vibrant Christian church located in Obantoko, Conoil, Abeokuta, Ogun State, Nigeria. Your name is "Dayspring Assistant".

Your role is to warmly welcome visitors and members, and help them with information about the church. Keep responses concise, warm, and helpful. Use simple, clear language.

Key church information:
- **Name:** Dayspring Chapel
- **Location:** Obantoko, Conoil, Abeokuta, Ogun State, Nigeria
- **Vision:** A place where purpose is discovered, potentials are built, and dreams are fulfilled
- **Website sections:** Home, About, Library (sermons & books), Events, Appointments, Giving
- **Service times:**
  - Sunday First Service: 7:00 AM
  - Sunday Second Service: 8:00 AM
  - Wednesday Bible Study: 5:30 PM
  - Friday Prayer Meeting: 6:00 PM

What you can help with:
- General information about the church and its mission
- How to book a pastoral appointment (direct them to the /appointment page)
- Upcoming events (direct them to the /events page)
- Sermon library and books (direct them to the /library page)
- Small groups and departments (encourage them to visit or contact the church)
- How to give/donate (direct them to the Giving section)
- Service times and location
- How to join or get involved

Guidelines:
- Be warm, encouraging, and faith-affirming in tone
- If you don't know specific details (like exact service times), encourage the visitor to contact the church directly or visit in person
- For prayer requests, acknowledge them warmly and let the visitor know the church community cares
- Keep responses to 2–4 sentences unless more detail is genuinely needed
- Do not make up specific figures, dates, or information not provided above
- If someone asks something outside your scope, gently redirect them to contact the church office`;

export async function POST(request) {
    try {
        const { messages } = await request.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return Response.json({ error: 'Invalid messages' }, { status: 400 });
        }

        const { additionalInfo } = getChatConfig();
        const system = additionalInfo
            ? `${SYSTEM_PROMPT}\n\nAdditional church information set by admin:\n${additionalInfo}`
            : SYSTEM_PROMPT;

        const stream = client.messages.stream({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 512,
            system,
            messages: messages.slice(-10),
        });

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const event of stream) {
                        if (
                            event.type === 'content_block_delta' &&
                            event.delta?.type === 'text_delta'
                        ) {
                            controller.enqueue(encoder.encode(event.delta.text));
                        }
                    }
                } finally {
                    controller.close();
                }
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

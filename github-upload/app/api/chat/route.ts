import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(request: NextRequest) {
    if (!ai) {
        console.error('[API Error] GEMINI_API_KEY is missing');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { message, productName, manualText, history } = body;

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const name = productName || 'Product';
        const systemPrompt = `You are a product expert assistant for the ${name}. 
You have access to the product's user manual. Always answer from the manual first. 
If the manual doesn't cover something, use your general knowledge or search the web. 
Be concise, helpful, and reference specific manual sections when relevant.

Manual content:
${manualText || 'No manual available - answer from general knowledge.'}`;

        // Build conversation contents
        const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

        // System setup
        contents.push({
            role: 'user',
            parts: [{ text: systemPrompt + '\n\nPlease acknowledge you are ready to help with this product.' }],
        });
        contents.push({
            role: 'model',
            parts: [{ text: `I'm ready to help you with the ${name}. I have the context loaded. What would you like to know?` }],
        });

        // Safe history processing
        if (history && Array.isArray(history)) {
            history.slice(-10).forEach((msg) => { // Limit history to last 10 messages for performance/tokens
                if (msg.content && msg.role) {
                    contents.push({
                        role: msg.role === 'user' ? 'user' : 'model',
                        parts: [{ text: String(msg.content) }],
                    });
                }
            });
        }

        // Current message
        contents.push({
            role: 'user',
            parts: [{ text: message }],
        });

        // Stream the response
        const stream = await ai.models.generateContentStream({
            model: 'gemini-3-flash-preview',
            contents,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const text = chunk.text;
                        if (text) {
                            controller.enqueue(encoder.encode(text));
                        }
                    }
                    controller.close();
                } catch (err: any) {
                    console.error('[Stream Error] Chat stream exception:', err?.message || err);
                    controller.error(err);
                }
            },
        });

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error: any) {
        console.error('[API Error] chat exception:', error?.message || error);

        if (error?.status === 429) {
            return NextResponse.json({ error: 'AI limit reached. Please wait.' }, { status: 429 });
        }

        return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
    }
}

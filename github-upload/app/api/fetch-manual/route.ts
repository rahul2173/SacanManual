import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(req: Request) {
    if (!ai) {
        console.error('[API Error] GEMINI_API_KEY is missing');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { productName, brand } = body;

        if (!productName || typeof productName !== 'string') {
            return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
        }

        const prompt = `
You are a product manual finder. The user has scanned: "${productName}" by "${brand || 'Unknown Brand'}".

Your tasks:
1. Search for the OFFICIAL user manual for this exact product
2. Look in these specific places in order:
   - Official manufacturer support website (e.g. support.apple.com, sony.com/support, samsung.com/support)
   - manualslib.com
   - Any official PDF hosted by the manufacturer

3. Return the following in your response:
   - The direct PDF download URL if found (must end in .pdf or be a direct download)
   - The manual page URL if no PDF
   - A comprehensive summary of the manual covering:
     * Product overview and what's in the box
     * Initial setup steps
     * Main features and how to use them
     * Settings and configuration
     * Troubleshooting common issues
     * Safety warnings
     * Technical specifications

Be specific and detailed. If this is a well-known product like an iPhone, Samsung Galaxy,
Sony headphones, Dyson vacuum, etc — you absolutely have this information.
Do not say the manual is unavailable for mainstream products.
Provide at minimum 800 words of manual content regardless of whether a PDF URL is found.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{
                role: 'user',
                parts: [{ text: prompt }]
            }],
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const text = response.text;
        const groundingMetadata = (response as any).candidates?.[0]?.groundingMetadata;
        const groundingChunks = groundingMetadata?.groundingChunks || [];

        // Extract all URLs from grounding
        const allFoundUrls: string[] = groundingChunks
            .map((chunk: any) => chunk?.web?.uri)
            .filter(Boolean);

        if (allFoundUrls.length === 0) {
            console.warn(`[API Warning] No grounding URLs found for: ${productName}`);
        }

        // Try to find PDF URL from grounding results
        const pdfUrl = allFoundUrls.find((url: string) =>
            url.toLowerCase().endsWith('.pdf') ||
            url.toLowerCase().includes('.pdf?') ||
            url.toLowerCase().includes('/pdf/')
        ) || null;

        // If no direct PDF, find best manual page URL
        const manualPageUrl = allFoundUrls.find((url: string) =>
            url.includes('manual') ||
            url.includes('support') ||
            url.includes('guide') ||
            url.includes('manualslib') ||
            url.includes('documentation')
        ) || allFoundUrls[0] || null;

        let sourceHostname = 'Gemini Knowledge Base';
        try {
            if (manualPageUrl) {
                sourceHostname = new URL(manualPageUrl).hostname;
            }
        } catch (e) {
            console.error('[API Error] Invalid manualPageUrl generated:', manualPageUrl);
        }

        return NextResponse.json({
            pdfUrl: pdfUrl,
            manualPageUrl: manualPageUrl,
            allFoundUrls: allFoundUrls,
            manualText: text || 'Manual content summary unavailable.',
            source: sourceHostname,
            found: allFoundUrls.length > 0 || (text && text.length > 200),
            groundingUsed: groundingChunks.length > 0
        });

    } catch (error: any) {
        console.error('[API Error] fetch-manual exception:', error?.message || error);

        if (error?.status === 429) {
            return NextResponse.json({
                error: 'AI search limit reached. Please wait a moment and try again.',
                found: false
            }, { status: 429 });
        }

        return NextResponse.json({
            error: 'Failed to find manual',
            found: false,
            manualText: 'Manual not found'
        }, { status: 500 });
    }
}

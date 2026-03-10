import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(request: NextRequest) {
    if (!ai) {
        console.error('[API Error] GEMINI_API_KEY is missing');
        return NextResponse.json(
            { error: 'Server configuration error' },
            { status: 500 }
        );
    }

    try {
        const { imageBase64 } = await request.json();

        if (!imageBase64 || typeof imageBase64 !== 'string') {
            return NextResponse.json(
                { error: 'Valid image data is required' },
                { status: 400 }
            );
        }

        // Strip data URL prefix if present and validate base64 length
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        if (base64Data.length < 100) {
            return NextResponse.json(
                { error: 'Image data appears invalid or too small' },
                { status: 400 }
            );
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
                {
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: base64Data,
                    },
                },
                {
                    text: `Identify the physical product in this image. Return ONLY a valid JSON object with these exact fields:
{
  "productName": "full official name with model number if visible",
  "brand": "brand name",
  "category": "product category",
  "confidence": "high" or "medium" or "low",
  "description": "one sentence description"
}
If no clear product is visible, return: { "productName": null, "brand": "", "category": "", "confidence": "low", "description": "No product detected" }`,
                },
            ],
            config: {
                responseMimeType: 'application/json',
            },
        });

        const text = response.text;

        if (!text) {
            console.warn('[API Warning] Gemini returned empty identification response');
            return NextResponse.json(
                { productName: null, brand: '', category: '', confidence: 'low', description: 'Could not process image' },
                { status: 200 }
            );
        }

        try {
            const parsed = JSON.parse(text);
            return NextResponse.json(parsed);
        } catch (parseError) {
            console.error('[API Error] Failed to parse Gemini response JSON:', text);
            return NextResponse.json(
                { error: 'Failed to process identification results' },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error('[API Error] identify-product exception:', error?.message || error);

        if (error?.status === 429) {
            return NextResponse.json(
                { error: 'AI limit reached. Please wait a moment and try again.' },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to identify product. Please try again.' },
            { status: 500 }
        );
    }
}

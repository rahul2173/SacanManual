import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        services: {
            gemini_api: !!process.env.GEMINI_API_KEY
        }
    });
}

export interface IdentifiedProduct {
    productName: string;
    brand: string;
    category: string;
    confidence: 'high' | 'medium' | 'low';
    description: string;
}

export interface ManualData {
    pdfUrl: string | null;
    manualPageUrl: string | null;
    allFoundUrls: string[];
    manualText: string;
    source: string;
    found: boolean;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
    timestamp: number;
}

export type Screen = 'scan' | 'confirm' | 'manual';

export interface IdentifyRequest {
    imageBase64: string;
}

export interface IdentifyResponse {
    productName: string | null;
    brand: string;
    category: string;
    confidence: 'high' | 'medium' | 'low';
    description: string;
}

export interface ManualRequest {
    productName: string;
    brand: string;
}

export interface ChatRequest {
    message: string;
    productName: string;
    manualText: string;
    history: Array<{ role: 'user' | 'model'; content: string }>;
}

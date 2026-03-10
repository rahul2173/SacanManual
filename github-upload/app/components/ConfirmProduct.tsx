'use client';

import { CheckCircle2, RefreshCw, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import type { IdentifiedProduct } from '@/app/types';

interface ConfirmProductProps {
    capturedImage: string;
    product: IdentifiedProduct;
    isLoading: boolean;
    onConfirm: () => void;
    onRetry: () => void;
}

export default function ConfirmProduct({
    capturedImage,
    product,
    isLoading,
    onConfirm,
    onRetry,
}: ConfirmProductProps) {
    const confidenceIcon = {
        high: <ShieldCheck className="w-4 h-4 text-green-400" />,
        medium: <Shield className="w-4 h-4 text-yellow-400" />,
        low: <ShieldAlert className="w-4 h-4 text-red-400" />,
    };

    const confidenceColor = {
        high: 'bg-green-500/10 text-green-400 border-green-500/20',
        medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        low: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    return (
        <div className="screen-transition flex flex-col items-center justify-center min-h-screen p-6 gap-6">
            {/* Captured Image */}
            <div className="w-40 h-40 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                <img
                    src={capturedImage}
                    alt="Captured product"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Product Name */}
            <div className="text-center max-w-sm">
                <h1 className="text-2xl font-bold text-white mb-2 font-mono">
                    Is this a {product.productName}?
                </h1>
                <p className="text-gray-400 text-sm mb-3">{product.description}</p>

                {/* Confidence Badge */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs 
                        font-medium border ${confidenceColor[product.confidence]}`}>
                    {confidenceIcon[product.confidence]}
                    {product.confidence} confidence
                </div>

                {/* Brand & Category */}
                <div className="flex items-center justify-center gap-3 mt-3">
                    {product.brand && (
                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                            {product.brand}
                        </span>
                    )}
                    {product.category && (
                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                            {product.category}
                        </span>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full max-w-xs">
                <button
                    onClick={onRetry}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 
                     bg-white/5 hover:bg-white/10 border border-white/10
                     text-white rounded-2xl transition-all text-sm font-medium
                     disabled:opacity-50"
                    aria-label="Try scanning again"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 
                     bg-blue-500 hover:bg-blue-600 text-white rounded-2xl 
                     transition-all text-sm font-medium disabled:opacity-50"
                    aria-label="Confirm product identification"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Fetching...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-4 h-4" />
                            Yes, that&apos;s it
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

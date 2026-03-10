'use client';

import { ManualData } from '@/app/types';
import { ExternalLink, FileText, Info } from 'lucide-react';

interface ManualViewerProps {
    manual: ManualData;
    productName: string;
}

export function ManualViewer({ manual, productName }: ManualViewerProps) {
    if (!manual.found && !manual.manualPageUrl && (!manual.manualText || manual.manualText.length < 200)) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800 text-center" role="alert">
                <Info className="w-12 h-12 text-zinc-600 mb-4" aria-hidden="true" />
                <h3 className="text-xl font-medium mb-2">Manual not found</h3>
                <p className="text-zinc-400 mb-6 max-w-xs">
                    We couldn't find an official manual for this product online.
                </p>
                <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(productName)}+user+manual+PDF`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors border border-zinc-700"
                    aria-label={`Search for ${productName} manual on Google`}
                >
                    Search manually on Google
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 animate-fade-in" role="article" aria-label={`${productName} Manual Information`}>
            {/* Direct PDF View */}
            {manual.pdfUrl && (
                <div className="space-y-3">
                    <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-black aspect-[3/4] w-full relative">
                        <iframe
                            src={manual.pdfUrl}
                            className="w-full h-full border-none"
                            title={`${productName} Manual PDF Document`}
                        />
                    </div>
                    <div className="flex justify-center">
                        <a
                            href={manual.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
                        >
                            <ExternalLink className="w-3 h-3" />
                            Open PDF in new tab if it doesn't load
                        </a>
                    </div>
                </div>
            )}

            {/* Manual Page URL (if no PDF or as secondary) */}
            {!manual.pdfUrl && manual.manualPageUrl && (
                <div className="p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex flex-col items-center text-center">
                    <FileText className="w-10 h-10 text-blue-400 mb-3" aria-hidden="true" />
                    <h3 className="text-lg font-semibold mb-2">Official manual page found</h3>
                    <p className="text-zinc-400 mb-4 text-sm max-w-sm">
                        Gemini found the official manual page. You can open it for full technical details.
                    </p>
                    <a
                        href={manual.manualPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex items-center gap-2"
                        aria-label={`Open official manual for ${productName}`}
                    >
                        Open Official Manual
                        <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    </a>
                </div>
            )}

            {/* Text Summary - Always show if available and substantial */}
            {manual.manualText && manual.manualText.length > 200 && (
                <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 md:p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Info className="w-5 h-5 text-blue-400" aria-hidden="true" />
                        </div>
                        <h3 className="text-xl font-bold font-mono tracking-tight text-white">Manual Summary</h3>
                    </div>

                    <div className="prose prose-invert max-w-none prose-p:text-zinc-400 prose-headings:text-white prose-li:text-zinc-400 prose-strong:text-blue-400 space-y-4 text-zinc-300 leading-relaxed font-sans">
                        {manual.manualText.split('\n').map((line, i) => {
                            const cleanLine = line.trim();
                            if (!cleanLine && i > 0) return <div key={i} className="h-2" />;

                            if (cleanLine.startsWith('###')) return <h4 key={i} className="text-lg font-bold mt-6 mb-2 text-white">{cleanLine.replace('###', '').trim()}</h4>;
                            if (cleanLine.startsWith('##')) return <h3 key={i} className="text-xl font-bold mt-8 mb-4 border-b border-zinc-800 pb-2 text-white">{cleanLine.replace('##', '').trim()}</h3>;
                            if (cleanLine.startsWith('*') || cleanLine.startsWith('-')) {
                                return <li key={i} className="ml-4 list-disc pl-2 mb-2 text-zinc-400">{cleanLine.substring(1).trim()}</li>;
                            }

                            return <p key={i} className="text-zinc-300">{cleanLine}</p>;
                        })}
                    </div>
                </div>
            )}

            {/* Source Info */}
            {manual.source && (
                <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-zinc-600 pt-4 font-mono">
                    <div className="w-1 h-1 rounded-full bg-zinc-700" />
                    Source: {manual.source}
                </div>
            )}
        </div>
    );
}

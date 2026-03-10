'use client';

interface LoadingOverlayProps {
    message?: string;
}

export default function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
    return (
        <div className="fixed inset-0 bg-[#0a0a0a]/90 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                    {/* Outer ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
                    {/* Spinning ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
                    {/* Inner dot */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                    </div>
                </div>
                <p className="text-white text-sm font-medium animate-pulse">{message}</p>
            </div>
        </div>
    );
}

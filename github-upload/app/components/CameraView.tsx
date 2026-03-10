'use client';

import { useEffect, useRef } from 'react';
import { Camera, AlertCircle, RefreshCw } from 'lucide-react';

interface CameraViewProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isActive: boolean;
    error: string | null;
    isProcessing: boolean;
    onCapture: () => void;
    onRetryPermission: () => void;
}

export default function CameraView({
    videoRef,
    isActive,
    error,
    isProcessing,
    onCapture,
    onRetryPermission,
}: CameraViewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Scan line animation for processing state
    useEffect(() => {
        if (!isProcessing || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let y = 0;
        let direction = 1;
        let animFrame: number;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const gradient = ctx.createLinearGradient(0, y - 2, 0, y + 2);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.6)');
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, y - 2, canvas.width, 4);

            y += direction * 2;
            if (y > canvas.height || y < 0) direction *= -1;

            animFrame = requestAnimationFrame(animate);
        };

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        animate();

        return () => cancelAnimationFrame(animFrame);
    }, [isProcessing]);

    if (error) {
        return (
            <div className="camera-view flex flex-col items-center justify-center gap-6 p-8">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <div className="text-center">
                    <p className="text-white text-lg font-medium mb-2">Camera Unavailable</p>
                    <p className="text-gray-400 text-sm max-w-xs">{error}</p>
                </div>
                <button
                    onClick={onRetryPermission}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white 
                     rounded-full transition-colors text-sm font-medium"
                    aria-label="Retry camera access"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="camera-view relative">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                aria-live="polite"
                aria-label="Camera feed for product scanning"
            />

            {/* Scan line overlay during processing */}
            {isProcessing && (
                <>
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-none z-10"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20">
                        <div className="text-center">
                            <div className="scan-pulse w-16 h-16 rounded-full border-2 border-blue-400 mx-auto mb-4" />
                            <p className="text-white text-sm font-medium animate-pulse">
                                Identifying product...
                            </p>
                        </div>
                    </div>
                </>
            )}

            {/* Viewfinder corners */}
            {isActive && !isProcessing && (
                <div className="absolute inset-0 pointer-events-none z-10">
                    <div className="viewfinder-corner top-8 left-8" />
                    <div className="viewfinder-corner top-8 right-8 rotate-90" />
                    <div className="viewfinder-corner bottom-28 left-8 -rotate-90" />
                    <div className="viewfinder-corner bottom-28 right-8 rotate-180" />
                </div>
            )}

            {/* Capture button */}
            {isActive && !isProcessing && (
                <div className="absolute bottom-0 left-0 right-0 pb-8 flex justify-center z-20">
                    <button
                        onClick={onCapture}
                        className="w-[72px] h-[72px] rounded-full bg-white/90 hover:bg-white 
                       border-4 border-white/30 transition-all active:scale-90
                       flex items-center justify-center shadow-lg shadow-black/30"
                        aria-label="Capture product image"
                    >
                        <Camera className="w-7 h-7 text-gray-900" />
                    </button>
                </div>
            )}
        </div>
    );
}

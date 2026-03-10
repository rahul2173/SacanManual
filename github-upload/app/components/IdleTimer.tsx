'use client';

import { Clock } from 'lucide-react';

interface IdleTimerProps {
    showWarning: boolean;
}

export default function IdleTimer({ showWarning }: IdleTimerProps) {
    if (!showWarning) return null;

    return (
        <div className="fixed top-4 left-4 right-4 z-50 animate-slide-down">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 
                      flex items-center gap-3 backdrop-blur-sm max-w-md mx-auto">
                <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <p className="text-yellow-400 text-sm">
                    Session resetting in 60 seconds due to inactivity
                </p>
            </div>
        </div>
    );
}

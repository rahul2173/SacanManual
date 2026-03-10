'use client';

import { Volume2, VolumeX } from 'lucide-react';

interface SpeechControlsProps {
    isSpeaking: boolean;
    onSpeak: () => void;
    onStop: () => void;
}

export default function SpeechControls({ isSpeaking, onSpeak, onStop }: SpeechControlsProps) {
    return (
        <button
            onClick={isSpeaking ? onStop : onSpeak}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium 
                  transition-all ${isSpeaking
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                    : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                }`}
            aria-label={isSpeaking ? 'Stop reading' : 'Read manual aloud'}
        >
            {isSpeaking ? (
                <>
                    <VolumeX className="w-4 h-4" />
                    Stop
                </>
            ) : (
                <>
                    <Volume2 className="w-4 h-4" />
                    Listen
                </>
            )}
        </button>
    );
}

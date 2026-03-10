'use client';

import { useState, useCallback, useEffect } from 'react';

export function useSpeech() {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const speak = useCallback((text: string) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.volume = 1;

        const voices = window.speechSynthesis.getVoices();
        const preferred =
            voices.find((v) => v.lang === 'en-US' && !v.localService) ||
            voices.find((v) => v.lang.startsWith('en'));
        if (preferred) utterance.voice = preferred;

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    }, []);

    const stopSpeaking = useCallback(() => {
        if (typeof window === 'undefined') return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined') {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    return { isSpeaking, speak, stopSpeaking };
}

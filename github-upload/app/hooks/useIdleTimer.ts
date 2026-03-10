'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIdleTimerOptions {
    timeout?: number; // ms, default 15 min
    warningTime?: number; // ms before timeout to show warning, default 60s
    onTimeout: () => void;
}

export function useIdleTimer({
    timeout = 15 * 60 * 1000,
    warningTime = 60 * 1000,
    onTimeout,
}: UseIdleTimerOptions) {
    const [showWarning, setShowWarning] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const warningRef = useRef<NodeJS.Timeout | null>(null);

    const resetTimer = useCallback(() => {
        setShowWarning(false);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningRef.current) clearTimeout(warningRef.current);

        warningRef.current = setTimeout(() => {
            setShowWarning(true);
        }, timeout - warningTime);

        timeoutRef.current = setTimeout(() => {
            setShowWarning(false);
            onTimeout();
        }, timeout);
    }, [timeout, warningTime, onTimeout]);

    useEffect(() => {
        const events = ['click', 'keypress', 'touchstart', 'scroll', 'mousemove'];

        const handleActivity = () => resetTimer();

        events.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));
        resetTimer();

        return () => {
            events.forEach((event) => window.removeEventListener(event, handleActivity));
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (warningRef.current) clearTimeout(warningRef.current);
        };
    }, [resetTimer]);

    return { showWarning };
}

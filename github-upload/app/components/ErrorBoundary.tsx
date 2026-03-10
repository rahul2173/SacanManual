'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[Production Error] Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center shadow-2xl">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">Something went wrong</h2>
                        <p className="text-zinc-400 mb-8 leading-relaxed">
                            We encountered an unexpected error. Don't worry, your session data is safe. Try refreshing the app.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full btn-primary flex items-center justify-center gap-2 py-4 shadow-lg shadow-blue-900/20"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Refresh Application
                        </button>
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-8 p-4 bg-black/40 rounded-xl text-left border border-white/5 overflow-auto max-h-40">
                                <p className="text-red-400 text-xs font-mono break-all">{this.state.error?.message}</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

'use client';

import { useState, useCallback } from 'react';
import { useCamera } from '@/app/hooks/useCamera';
import { useIdleTimer } from '@/app/hooks/useIdleTimer';
import { useSpeech } from '@/app/hooks/useSpeech';
import { useOnlineStatus } from '@/app/hooks/useOnlineStatus';
import CameraView from '@/app/components/CameraView';
import ConfirmProduct from '@/app/components/ConfirmProduct';
import { ManualViewer } from '@/app/components/ManualViewer';
import ChatInterface from '@/app/components/ChatInterface';
import ErrorBoundary from '@/app/components/ErrorBoundary';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import SpeechControls from '@/app/components/SpeechControls';
import IdleTimer from '@/app/components/IdleTimer';
import DoneButton from '@/app/components/DoneButton';
import { FileText, Download, MessageSquare, WifiOff } from 'lucide-react';
import type { Screen, IdentifiedProduct, ManualData, ChatMessage } from '@/app/types';

export default function Home() {
  return (
    <ErrorBoundary>
      <HomeContent />
    </ErrorBoundary>
  );
}

function HomeContent() {
  // Core state
  const [screen, setScreen] = useState<Screen>('scan');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [identifiedProduct, setIdentifiedProduct] = useState<IdentifiedProduct | null>(null);
  const [manual, setManual] = useState<ManualData | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const isOnline = useOnlineStatus();
  const [activeTab, setActiveTab] = useState<'manual' | 'chat'>('manual');

  // Hooks
  const { videoRef, streamRef, isActive, error: cameraError, startCamera, captureImage, stopCamera } = useCamera();
  const { isSpeaking, speak, stopSpeaking } = useSpeech();

  // Reset session
  const resetSession = useCallback(() => {
    stopSpeaking();
    stopCamera();
    setScreen('scan');
    setCapturedImage(null);
    setIdentifiedProduct(null);
    setManual(null);
    setChatHistory([]);
    setIsLoading(false);
    setLoadingMessage('');
    setIsStreaming(false);
    setStreamingContent('');
    setError(null);
    setActiveTab('manual');
    // Restart camera after reset
    setTimeout(() => startCamera(), 300);
  }, [stopSpeaking, stopCamera, startCamera]);

  const { showWarning } = useIdleTimer({ onTimeout: resetSession });


  // Start camera on first render
  const startCameraInitial = useCallback(() => {
    if (!isActive && screen === 'scan') {
      startCamera();
    }
  }, [isActive, screen, startCamera]);

  // Auto-start camera
  if (typeof window !== 'undefined' && screen === 'scan' && !isActive && !cameraError) {
    setTimeout(startCameraInitial, 100);
  }

  // ── HANDLERS ──

  const handleCapture = async () => {
    const image = captureImage();
    if (!image) return;

    setCapturedImage(image);
    setIsLoading(true);
    setLoadingMessage('Identifying product...');

    try {
      const res = await fetch('/api/identify-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: image }),
      });

      if (!res.ok) throw new Error('Identification failed');

      const data = await res.json();

      if (!data.productName) {
        setError("Couldn't identify this product. Try better lighting or a closer angle.");
        setIsLoading(false);
        return;
      }

      setIdentifiedProduct(data);
      setScreen('confirm');
      stopCamera();
    } catch {
      setError('Failed to identify product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!identifiedProduct) return;

    setIsLoading(true);
    setLoadingMessage('Fetching manual...');

    try {
      const res = await fetch('/api/fetch-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: identifiedProduct.productName,
          brand: identifiedProduct.brand,
        }),
      });

      if (!res.ok) throw new Error('Manual fetch failed');

      const data = await res.json();
      setManual(data);
      setScreen('manual');
    } catch {
      // Even if manual fetch fails, go to manual screen with empty manual
      setManual({
        pdfUrl: null,
        manualPageUrl: null,
        allFoundUrls: [],
        manualText: `Manual not found online, but you can still ask me anything about the ${identifiedProduct.productName}.`,
        source: 'N/A',
        found: false,
      });
      setScreen('manual');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setCapturedImage(null);
    setIdentifiedProduct(null);
    setError(null);
    setScreen('scan');
    startCamera();
  };

  const handleSendMessage = async (message: string) => {
    if (!identifiedProduct) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };
    setChatHistory((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setStreamingContent('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          productName: identifiedProduct.productName,
          manualText: manual?.manualText || '',
          history: chatHistory.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error('Chat failed');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          setStreamingContent(fullContent);
        }
      }

      const aiMessage: ChatMessage = {
        role: 'model',
        content: fullContent,
        timestamp: Date.now(),
      };
      setChatHistory((prev) => [...prev, aiMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        role: 'model',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  const handleDownload = () => {
    if (!manual) return;

    // Priority 1: Direct PDF URL
    if (manual.pdfUrl) {
      window.open(manual.pdfUrl, '_blank');
      return;
    }

    // Priority 2: Manual page URL (open in new tab)
    if (manual.manualPageUrl) {
      window.open(manual.manualPageUrl, '_blank');
      return;
    }

    // Priority 3: Download text content as .txt ONLY if we have real content
    if (manual.manualText && manual.manualText.length > 200) {
      const blob = new Blob([manual.manualText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${identifiedProduct?.productName || 'manual'}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    alert('Manual not available for download. Try searching on the manufacturer website.');
  };

  const handleListen = () => {
    if (manual?.manualText) {
      speak(manual.manualText);
    }
  };

  // ── RENDER ──

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500/10 border-b border-red-500/30 px-4 py-2 
                        flex items-center justify-center gap-2" role="alert" aria-live="assertive">
          <WifiOff className="w-4 h-4 text-red-400" />
          <p className="text-red-400 text-sm">No internet connection</p>
        </div>
      )}

      {/* Idle Timer Warning */}
      <IdleTimer showWarning={showWarning} />

      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay message={loadingMessage} />}

      {/* Error Toast */}
      {error && screen === 'scan' && (
        <div className="fixed top-4 left-4 right-4 z-40 animate-slide-down">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 max-w-md mx-auto">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => { setError(null); handleRetry(); }}
              className="text-red-300 text-xs mt-1 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ═══ SCREEN 1: SCAN ═══ */}
      {screen === 'scan' && (
        <div className="h-screen">
          <CameraView
            videoRef={videoRef}
            isActive={isActive}
            error={cameraError}
            isProcessing={isLoading}
            onCapture={handleCapture}
            onRetryPermission={() => { setError(null); startCamera(); }}
          />
        </div>
      )}

      {/* ═══ SCREEN 2: CONFIRM ═══ */}
      {screen === 'confirm' && capturedImage && identifiedProduct && (
        <ConfirmProduct
          capturedImage={capturedImage}
          product={identifiedProduct}
          isLoading={isLoading}
          onConfirm={handleConfirm}
          onRetry={handleRetry}
        />
      )}

      {/* ═══ SCREEN 3: MANUAL & CHAT ═══ */}
      {screen === 'manual' && identifiedProduct && (
        <div className="min-h-screen pb-24">
          {/* Product Info Bar */}
          <div className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/5">
            <div className="max-w-2xl mx-auto px-4 py-3">
              <div className="flex items-center gap-3">
                {capturedImage && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                    <img src={capturedImage} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-white font-semibold text-sm font-mono truncate">
                    {identifiedProduct.productName}
                  </h1>
                  <p className="text-gray-500 text-xs">{identifiedProduct.brand}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'manual'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                    }`}
                  aria-label="View manual"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Manual
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium 
                             bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition-all"
                  aria-label="Download manual"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
                <SpeechControls
                  isSpeaking={isSpeaking}
                  onSpeak={handleListen}
                  onStop={stopSpeaking}
                />
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'chat'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                    }`}
                  aria-label="Open chat"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-2xl mx-auto px-4 py-6">
            {activeTab === 'manual' && manual && (
              <div className="screen-transition">
                <ManualViewer
                  manual={manual}
                  productName={identifiedProduct.productName}
                />
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="screen-transition">
                <div className="bg-white/[0.02] rounded-2xl border border-white/10 overflow-hidden">
                  <ChatInterface
                    messages={chatHistory}
                    productName={identifiedProduct.productName}
                    manualText={manual?.manualText || ''}
                    onSendMessage={handleSendMessage}
                    isStreaming={isStreaming}
                    streamingContent={streamingContent}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Done Button */}
          <DoneButton onReset={resetSession} />
        </div>
      )}
    </main>
  );
}

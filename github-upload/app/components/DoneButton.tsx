'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface DoneButtonProps {
    onReset: () => void;
}

export default function DoneButton({ onReset }: DoneButtonProps) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 
                   bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg 
                   shadow-red-500/20 transition-all text-sm font-semibold"
                aria-label="End session and reset"
            >
                Done
                <X className="w-4 h-4" />
            </button>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                    <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 max-w-sm w-full 
                          shadow-2xl animate-scale-in">
                        <h3 className="text-white text-lg font-semibold mb-2">Reset session?</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            All data will be cleared and you&apos;ll return to the camera screen.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 
                           text-white rounded-xl text-sm font-medium transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    onReset();
                                }}
                                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 
                           text-white rounded-xl text-sm font-medium transition-all"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

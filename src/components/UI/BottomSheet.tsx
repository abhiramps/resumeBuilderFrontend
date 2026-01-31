import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
    isOpen,
    onClose,
    title,
    children
}) => {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setIsAnimatingOut(false);
        } else if (shouldRender) {
            setIsAnimatingOut(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setIsAnimatingOut(false);
            }, 300); // Match animation duration
            return () => clearTimeout(timer);
        }
    }, [isOpen, shouldRender]);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!shouldRender) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
            {/* Backdrop */}
            <div 
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
                    isAnimatingOut ? 'opacity-0' : 'animate-fade-in'
                }`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sheet */}
            <div 
                className={`bg-white rounded-t-2xl shadow-xl w-full max-h-[85vh] flex flex-col z-10 ${
                    isAnimatingOut 
                        ? 'translate-y-full transition-transform duration-300 ease-in' 
                        : 'animate-slide-up'
                }`}
                role="dialog"
                aria-modal="true"
            >
                {/* Handle / Header */}
                <div className="flex-shrink-0 pt-3 pb-3 px-4 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-2xl z-10">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
                    
                    <div className="mt-4 w-full flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">{title || 'Edit'}</h2>
                        <button 
                            onClick={onClose}
                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div 
                    className="overflow-y-auto flex-1 p-4 pb-safe-area"
                >
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};
/**
 * Skeleton Card Component
 * Loading placeholder for resume cards with template-specific styling
 */

import React from 'react';

type SkeletonVariant = 'classic' | 'modern' | 'minimal' | 'professional' | 'academic';

interface SkeletonCardProps {
    variant?: SkeletonVariant;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ variant = 'professional' }) => {
    // Styling based on variant to mimic the actual templates
    const getPreviewContent = () => {
        switch (variant) {
            case 'modern':
                return (
                    // Modern: Sidebar + Content, Blue accents
                    <div className="w-full h-full p-3 flex gap-2 opacity-60">
                        <div className="w-1/3 h-full flex flex-col gap-2">
                            <div className="w-full h-1/4 bg-blue-100/50 rounded-sm"></div>
                            <div className="w-full h-3/4 bg-gray-100/50 rounded-sm"></div>
                        </div>
                        <div className="w-2/3 h-full flex flex-col gap-2">
                            <div className="w-full h-8 bg-gray-200/50 rounded-sm"></div>
                            <div className="w-full h-20 bg-gray-100/50 rounded-sm"></div>
                            <div className="w-full h-20 bg-gray-100/50 rounded-sm"></div>
                        </div>
                    </div>
                );
            case 'minimal':
                return (
                    // Minimal: Dense text lines, Monochrome
                    <div className="w-full h-full p-4 flex flex-col gap-2 opacity-50">
                        <div className="w-1/2 h-4 bg-gray-300/50 self-start mb-2"></div>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="w-full h-2 bg-gray-200/50"></div>
                        ))}
                    </div>
                );
            case 'academic':
                return (
                    // Academic: Header + Serif-like text blocks
                    <div className="w-full h-full p-4 flex flex-col gap-3 opacity-60">
                        <div className="w-full h-6 bg-gray-300/50 self-center mb-1"></div>
                        <div className="w-full h-px bg-gray-300"></div>
                        <div className="w-full h-16 bg-gray-100/50"></div>
                        <div className="w-full h-16 bg-gray-100/50"></div>
                    </div>
                );
            case 'classic':
                return (
                    // Classic: Traditional layout
                    <div className="w-full h-full p-4 flex flex-col gap-3 opacity-60">
                        <div className="w-3/4 h-5 bg-yellow-900/10 self-center mb-2"></div>
                        <div className="w-full h-px bg-gray-300"></div>
                        <div className="w-full h-12 bg-gray-100/50"></div>
                        <div className="w-full h-12 bg-gray-100/50"></div>
                    </div>
                );
            default: // professional
                return (
                    // Professional: Clean header, structured
                    <div className="w-full h-full p-4 flex flex-col gap-3 opacity-60">
                        <div className="w-full h-8 bg-slate-200/50 mb-1"></div>
                        <div className="flex gap-2">
                            <div className="w-1/3 h-24 bg-gray-100/50"></div>
                            <div className="w-2/3 h-24 bg-gray-100/50"></div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className={`
            flex flex-col
            bg-white/40 backdrop-blur-sm
            rounded-2xl border border-white/40 shadow-sm
            overflow-hidden
            animate-pulse
        `}>
            {/* Preview Area - Matches ResumeCard aspect ratio */}
            <div className="aspect-[1/1.3] w-full bg-white/50 relative overflow-hidden border-b border-white/20">
                {getPreviewContent()}
                
                {/* Shimmer overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
            </div>

            {/* Footer Area */}
            <div className="px-4 pb-4 pt-3 flex flex-col gap-2">
                <div className="h-4 bg-gray-200/50 rounded w-3/4"></div>
                <div className="flex justify-between items-center mt-1">
                    <div className="h-3 bg-gray-200/50 rounded w-16 px-2"></div>
                    <div className="h-3 bg-gray-200/50 rounded w-12"></div>
                </div>
            </div>
        </div>
    );
};

export const SkeletonCardGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
    const variants: SkeletonVariant[] = ['modern', 'minimal', 'professional', 'classic', 'academic'];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard 
                    key={index} 
                    variant={variants[index % variants.length]} 
                />
            ))}
        </div>
    );
};


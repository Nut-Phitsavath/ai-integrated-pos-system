'use client';

import { useState, useEffect } from 'react';

export default function AiInsightsWidget() {
    const [insights, setInsights] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const res = await fetch('/api/dashboard/insights');
                if (res.ok) {
                    const data = await res.json();
                    setInsights(data.insights || []);
                }
            } catch (error) {
                console.error('Failed to load AI insights', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInsights();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-linear-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 className="font-bold text-lg tracking-wide">AI Insights</h3>
                </div>
                <div className="space-y-3">
                    <div className="h-4 bg-white/20 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-white/20 rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-white/20 rounded animate-pulse w-5/6"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-linear-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>

            <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                    <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <h3 className="font-bold text-lg tracking-wide">Smart Insights</h3>
            </div>

            <div className="space-y-4 relative z-10">
                {insights.length > 0 ? (
                    insights.map((insight, index) => (
                        <div key={index} className="flex gap-3 items-start">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0"></span>
                            <p className="text-sm font-medium leading-relaxed text-indigo-50">
                                {insight}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 text-indigo-200 text-sm">
                        Not enough data yet for insights.
                    </div>
                )}
            </div>

            <div className="absolute bottom-4 right-4 text-[10px] text-white/30 uppercase tracking-widest font-bold">
                Powered by Gemini
            </div>
        </div>
    );
}

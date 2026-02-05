'use client';

import { useEffect, useState } from 'react';
import type { Product, CartItem } from '@/types';

interface Recommendation {
    product: Product | null;
    reason: string;
    tip: string;
    forItem: string; // Which cart item this recommendation is for
}

interface RecommendationWidgetProps {
    cartItems: CartItem[];
    onAddToCart: (product: Product) => void;
}

export default function RecommendationWidget({ cartItems, onAddToCart }: RecommendationWidgetProps) {
    const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (cartItems.length === 0) {
            setRecommendation(null);
            return;
        }

        const fetchRecommendation = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/recommendations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cartItems }),
                });

                const data = await response.json();
                setRecommendation(data.recommendation || null);
            } catch (error) {
                console.error('Failed to fetch recommendation:', error);
                setRecommendation(null);
            } finally {
                setIsLoading(false);
            }
        };

        // Debounce recommendation fetching
        const timeoutId = setTimeout(fetchRecommendation, 800);
        return () => clearTimeout(timeoutId);
    }, [cartItems]);

    if (cartItems.length === 0) return null;

    return (
        <div className="bg-linear-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
            <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 className="text-white font-bold text-sm">Smart Suggestion</h3>
                </div>
                {isLoading && (
                    <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                )}
            </div>

            <div className="p-4">
                {isLoading ? (
                    <div className="py-4 text-center">
                        <p className="text-sm text-gray-500 animate-pulse">Analyzing cart contents...</p>
                    </div>
                ) : recommendation ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Why & Tip Section */}
                        <div className="mb-4 space-y-2">
                            <div className="bg-indigo-50/50 rounded-lg p-2.5 border border-indigo-100">
                                <p className="text-xs text-indigo-900 leading-relaxed">
                                    <span className="font-bold text-indigo-700">Project Insight:</span> {recommendation.reason}
                                </p>
                            </div>

                            {recommendation.tip && (
                                <div className="bg-yellow-50 rounded-lg p-2.5 border border-yellow-100 flex gap-2">
                                    <svg className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    <p className="text-xs text-yellow-900 italic leading-relaxed">
                                        "{recommendation.tip}"
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Product Card */}
                        {recommendation.product && (
                            <div className="flex items-center bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors">
                                <div className="flex-1 min-w-0 mr-3">
                                    <h4 className="font-bold text-gray-900 text-sm truncate">{recommendation.product.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                            {recommendation.product.category}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            Stock: {recommendation.product.stockQuantity}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-lg font-bold text-indigo-600">
                                        ${recommendation.product.price.toFixed(2)}
                                    </div>
                                </div>
                                <button
                                    onClick={() => onAddToCart(recommendation.product!)}
                                    className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
                                    title="Add to Cart"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-4 text-center">
                        <p className="text-sm text-gray-400 italic">Add items to cart to get AI suggestions</p>
                    </div>
                )}
            </div>
        </div>
    );
}

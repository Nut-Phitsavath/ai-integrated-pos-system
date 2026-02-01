'use client';

import { useEffect, useState } from 'react';
import type { Product, CartItem } from '@/types';

interface Recommendation {
    product: Product;
    reason: string;
    forItem: string; // Which cart item this recommendation is for
}

interface RecommendationWidgetProps {
    cartItems: CartItem[];
    onAddToCart: (product: Product) => void;
}

export default function RecommendationWidget({ cartItems, onAddToCart }: RecommendationWidgetProps) {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (cartItems.length === 0) {
            setRecommendations([]);
            return;
        }

        const fetchRecommendations = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/recommendations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cartItems }),
                });

                const data = await response.json();
                setRecommendations(data.recommendations || []);
            } catch (error) {
                console.error('Failed to fetch recommendations:', error);
                setRecommendations([]);
            } finally {
                setIsLoading(false);
            }
        };

        // Debounce recommendation fetching
        const timeoutId = setTimeout(fetchRecommendations, 500);
        return () => clearTimeout(timeoutId);
    }, [cartItems]);

    if (cartItems.length === 0) return null;

    return (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </div>
                <h3 className="text-base font-bold text-gray-800">AI Recommendations</h3>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-6">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <p className="text-xs text-gray-600">AI thinking...</p>
                    </div>
                </div>
            ) : recommendations.length === 0 ? (
                <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No recommendations available</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {recommendations.map((rec, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
                            {/* Attribution - Which product is this for */}
                            <div className="flex items-center gap-1.5 mb-2">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-xs font-medium text-purple-700">
                                    For: <span className="font-semibold">{rec.forItem}</span>
                                </p>
                            </div>

                            {/* AI Reasoning */}
                            <div className="bg-indigo-50 rounded-lg p-2 mb-3">
                                <p className="text-xs text-indigo-900 leading-relaxed">
                                    <span className="font-semibold">Why we suggest this:</span> {rec.reason}
                                </p>
                            </div>

                            {/* Product Card */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-gray-900 mb-1">{rec.product.name}</h4>
                                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                        {rec.product.description || 'Quality hardware product'}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded">
                                            {rec.product.category}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {rec.product.stockQuantity} in stock
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    <div className="text-xl font-bold text-indigo-600">
                                        ${rec.product.price.toFixed(2)}
                                    </div>
                                    <button
                                        onClick={() => onAddToCart(rec.product)}
                                        className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-1"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import type { Product, CartItem } from '@/types';

interface RecommendationWidgetProps {
    cartItems: CartItem[];
    onAddToCart: (product: Product) => void;
}

export default function RecommendationWidget({ cartItems, onAddToCart }: RecommendationWidgetProps) {
    const [recommendation, setRecommendation] = useState<Product | null>(null);
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
                setRecommendation(data.recommendation);
            } catch (error) {
                console.error('Failed to fetch recommendation:', error);
                setRecommendation(null);
            } finally {
                setIsLoading(false);
            }
        };

        // Debounce recommendation fetching
        const timeoutId = setTimeout(fetchRecommendation, 500);
        return () => clearTimeout(timeoutId);
    }, [cartItems]);

    if (cartItems.length === 0) return null;

    return (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-purple-200">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">AI Recommendation</h3>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center gap-3">
                        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-sm text-gray-600">Generating recommendation...</p>
                    </div>
                </div>
            ) : recommendation ? (
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start gap-3">
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">Recommended for you</p>
                            <h4 className="font-bold text-gray-800 mb-1">{recommendation.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                                    {recommendation.category}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {recommendation.stockQuantity} in stock
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold text-indigo-600 mb-2">
                                ${Number(recommendation.price).toFixed(2)}
                            </p>
                            <button
                                onClick={() => onAddToCart(recommendation)}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                    No recommendations available at the moment.
                </div>
            )}
        </div>
    );
}

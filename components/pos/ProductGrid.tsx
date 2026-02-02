'use client';

import { useState, useEffect } from 'react';
import type { Product } from '@/types';

interface ProductGridProps {
    onAddToCart: (product: Product) => void;
    selectedCategory: string;
}

export default function ProductGrid({ onAddToCart, selectedCategory }: ProductGridProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory]);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const url = selectedCategory === 'All'
                ? '/api/products'
                : `/api/products?category=${encodeURIComponent(selectedCategory)}`;

            const response = await fetch(url);
            const data = await response.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p>No products found in this category</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => {
                // Category-based icons for fallback
                const categoryIcons: Record<string, string> = {
                    'Power Tools': '⚡',
                    'Hand Tools': '🔨',
                    'Building Materials': '🧱',
                    'Electrical': '💡',
                    'Plumbing': '🚰',
                    'Paint': '🎨',
                    'Safety': '🦺',
                    'Hardware': '🔩',
                };

                const icon = categoryIcons[product.category || ''] || '📦';

                return (
                    <div
                        key={product.id}
                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 overflow-hidden group flex flex-col"
                    >
                        {/* Product Image */}
                        <div className="relative h-32 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="text-5xl opacity-30">{icon}</div>
                            )}

                            {/* Stock Overlays */}
                            {product.stockQuantity === 0 && (
                                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transform -rotate-12 border-2 border-white">
                                        OUT OF STOCK
                                    </span>
                                </div>
                            )}

                            {/* Category Badge */}
                            <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                                <span className="inline-block px-2 py-1 text-xs font-semibold bg-white/90 backdrop-blur-sm text-indigo-700 rounded-full shadow-sm">
                                    {product.category}
                                </span>
                                {product.stockQuantity > 0 && product.stockQuantity < 5 && (
                                    <span className="inline-block px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full shadow-sm animate-pulse">
                                        Low Stock: {product.stockQuantity}
                                    </span>
                                )}
                                {product.stockQuantity >= 5 && product.stockQuantity < 20 && (
                                    <span className="inline-block px-2 py-1 text-xs font-bold bg-orange-400 text-white rounded-full shadow-sm">
                                        Selling Fast
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className={`p-3 flex-1 flex flex-col ${product.stockQuantity === 0 ? 'opacity-60 grayscale' : ''}`}>
                            <h3 className="font-semibold text-sm text-gray-900 mb-1">
                                {product.name}
                            </h3>

                            <p className="text-xs text-gray-500 mb-2 flex-1 line-clamp-2">
                                {product.description || 'No description available'}                         </p>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <div>
                                    <div className="text-xl font-bold text-indigo-600">
                                        ${product.price.toFixed(2)}
                                    </div>
                                    <div className={`text-xs font-medium ${product.stockQuantity === 0 ? 'text-red-500' :
                                            product.stockQuantity < 10 ? 'text-orange-500' : 'text-green-600'
                                        }`}>
                                        {product.stockQuantity === 0 ? 'Out of Stock' : `${product.stockQuantity} in stock`}
                                    </div>
                                </div>

                                <button
                                    onClick={() => onAddToCart(product)}
                                    disabled={product.stockQuantity === 0}
                                    className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

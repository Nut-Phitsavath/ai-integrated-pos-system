'use client';

import { useState } from 'react';
import type { Product } from '@/types';

interface ProductSearchProps {
    onAddToCart: (product: Product) => void;
}

export default function ProductSearch({ onAddToCart }: ProductSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const handleSearch = async (searchQuery: string) => {
        setQuery(searchQuery);
        setSelectedIndex(-1); // Reset selection on new search

        if (searchQuery.length < 2) {
            setResults([]);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            setResults(data.products || []);
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = (product: Product) => {
        onAddToCart(product);
        setQuery('');
        setResults([]);
        setSelectedIndex(-1);
        // Keep focus on input for rapid entry
        document.getElementById('product-search-input')?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (results.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < results.length) {
                handleAddToCart(results[selectedIndex]);
            } else if (results.length > 0) {
                // If nothing selected but "Enter" pressed, select the first one (optional, but good for speed)
                handleAddToCart(results[0]);
            }
        } else if (e.key === 'Escape') {
            setResults([]);
            setSelectedIndex(-1);
        }
    };

    return (
        <div className="relative">
            <div className="relative">
                <input
                    id="product-search-input"
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search by product name or ID... (F2 to focus)"
                    className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none bg-white shadow-sm text-gray-900 placeholder:text-gray-500"
                    autoComplete="off"
                />
                <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
                {/* Keyboard Hint */}
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 hidden sm:block">
                    F2
                </span>
            </div>

            {/* Search Results */}
            {results.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto">
                    {results.map((product, index) => (
                        <div
                            key={product.id}
                            className={`p-4 border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer ${index === selectedIndex ? 'bg-indigo-50 border-indigo-100' : 'hover:bg-gray-50'
                                }`}
                            onClick={() => handleAddToCart(product)}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className={`font-semibold ${index === selectedIndex ? 'text-indigo-800' : 'text-gray-800'}`}>
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                                            {product.category}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Stock: {product.stockQuantity}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-lg font-bold text-indigo-600">${product.price.toFixed(2)}</p>
                                    <button className={`mt-2 px-3 py-1 text-sm rounded-lg transition-colors ${index === selectedIndex
                                            ? 'bg-indigo-700 text-white shadow-md'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        }`}>
                                        Add ↵
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isLoading && query.length >= 2 && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 text-center text-gray-500">
                    Searching...
                </div>
            )}
        </div>
    );
}

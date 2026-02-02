'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InventoryTable from '@/components/inventory/InventoryTable';
import AddProductModal from '@/components/inventory/AddProductModal';
import HeaderMenu from '@/components/layout/HeaderMenu';
import type { Product } from '@/types';

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredProducts(products);
            return;
        }

        const lowerQuery = searchQuery.toLowerCase();
        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(lowerQuery) ||
            product.category?.toLowerCase().includes(lowerQuery)
        );
        setFilteredProducts(filtered);
    }, [searchQuery, products]);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            setProducts(data.products || []);
            setFilteredProducts(data.products || []);
        } catch (error) {
            console.error('Failed to load products', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (!res.ok) throw new Error('Failed to update');

            // Update local state
            setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    };

    const handleDeleteProduct = async (id: string) => {
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete');

            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <HeaderMenu />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Actions Bar */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative max-w-md w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Product
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {products.length}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase">Total Items</p>
                            <p className="font-bold text-gray-900">Products</p>
                        </div>
                    </div>
                    <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                            {products.filter(p => p.stockQuantity === 0).length}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase">Out of Stock</p>
                            <p className="font-bold text-gray-900">Alerts</p>
                        </div>
                    </div>
                    <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                            {products.filter(p => p.stockQuantity < 10 && p.stockQuantity > 0).length}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase">Low Stock</p>
                            <p className="font-bold text-gray-900">Reorder</p>
                        </div>
                    </div>
                    <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                            $
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase">Total Value</p>
                            <p className="font-bold text-gray-900">
                                ${products.reduce((acc, p) => acc + (p.price * p.stockQuantity), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </p>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <InventoryTable
                        products={filteredProducts}
                        onUpdateProduct={handleUpdateProduct}
                        onDeleteProduct={handleDeleteProduct}
                    />
                )}
            </main>

            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onProductAdded={fetchProducts}
            />
        </div>
    );
}

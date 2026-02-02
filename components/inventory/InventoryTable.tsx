'use client';

import { useState } from 'react';
import type { Product } from '@/types';

interface InventoryTableProps {
    products: Product[];
    onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
}

export default function InventoryTable({ products, onUpdateProduct }: InventoryTableProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ price: string; stockQuantity: string }>({ price: '', stockQuantity: '' });
    const [isSaving, setIsSaving] = useState(false);

    const handleEditClick = (product: Product) => {
        setEditingId(product.id);
        setEditForm({
            price: product.price.toString(),
            stockQuantity: product.stockQuantity.toString(),
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({ price: '', stockQuantity: '' });
    };

    const handleSave = async (id: string) => {
        setIsSaving(true);
        try {
            await onUpdateProduct(id, {
                price: parseFloat(editForm.price),
                stockQuantity: parseInt(editForm.stockQuantity, 10),
            });
            setEditingId(null);
        } catch (error) {
            alert('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4 text-right">Price</th>
                            <th className="px-6 py-4 text-center">Stock</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => {
                            const isEditing = editingId === product.id;
                            const isLowStock = product.stockQuantity < 10;
                            const isOutOfStock = product.stockQuantity === 0;

                            return (
                                <tr
                                    key={product.id}
                                    className={`hover:bg-gray-50 transition-colors ${isEditing ? 'bg-indigo-50/50' : ''}`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg overflow-hidden border border-gray-200">
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    '📦'
                                                )}
                                            </div>
                                            <div className="font-semibold text-gray-900">{product.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <span className="inline-block px-2 py-1 bg-gray-100 rounded-md text-xs font-medium">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-medium">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editForm.price}
                                                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                                className="w-24 text-right px-2 py-1 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                                            />
                                        ) : (
                                            `$${product.price.toFixed(2)}`
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {isEditing ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setEditForm(p => ({ ...p, stockQuantity: Math.max(0, parseInt(p.stockQuantity) - 1).toString() }))}
                                                    className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 cursor-pointer"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    value={editForm.stockQuantity}
                                                    onChange={(e) => setEditForm({ ...editForm, stockQuantity: e.target.value })}
                                                    className="w-16 text-center px-2 py-1 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                                                />
                                                <button
                                                    onClick={() => setEditForm(p => ({ ...p, stockQuantity: (parseInt(p.stockQuantity) + 1).toString() }))}
                                                    className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 cursor-pointer"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        ) : (
                                            <span className={`font-bold ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-orange-500' : 'text-gray-700'}`}>
                                                {product.stockQuantity}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {isOutOfStock ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                Out of Stock
                                            </span>
                                        ) : isLowStock ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200 animate-pulse">
                                                Low Stock
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                In Stock
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {isEditing ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleSave(product.id)}
                                                    disabled={isSaving}
                                                    className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer"
                                                >
                                                    {isSaving ? '...' : 'Save'}
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    disabled={isSaving}
                                                    className="px-3 py-1 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEditClick(product)}
                                                className="text-indigo-600 hover:text-indigo-900 font-medium text-sm px-3 py-1 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

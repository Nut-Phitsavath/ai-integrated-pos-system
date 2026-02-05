'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import type { Product } from '@/types';

interface InventoryTableProps {
    products: Product[];
    onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
}

export default function InventoryTable({ products, onUpdateProduct, onDeleteProduct }: InventoryTableProps & { onDeleteProduct: (id: string) => Promise<void> }) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ price: string; stockQuantity: string }>({ price: '', stockQuantity: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

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
            toast.success('Product updated successfully');
        } catch (error) {
            toast.error('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        setIsDeleting(id);
        try {
            await onDeleteProduct(id);
            toast.success('Product deleted');
        } catch (error) {
            toast.error('Failed to delete product');
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Image</th>
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
                            const isThisDeleting = isDeleting === product.id;

                            return (
                                <tr
                                    key={product.id}
                                    className={`hover:bg-gray-50 transition-colors ${isEditing ? 'bg-indigo-50/50' : ''} ${isThisDeleting ? 'opacity-50' : ''}`}
                                >
                                    <td className="px-6 py-4 w-20">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl overflow-hidden border border-gray-200 shrink-0">
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                '📦'
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">
                                        {product.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <span className="inline-block px-2 py-1 bg-gray-100 rounded-md text-xs font-medium">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-medium text-gray-900">
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
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditClick(product)}
                                                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                                    title="Edit"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    disabled={!!isDeleting}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
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

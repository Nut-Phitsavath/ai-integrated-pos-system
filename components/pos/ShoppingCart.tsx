'use client';

import type { CartItem } from '@/types';

interface ShoppingCartProps {
    items: CartItem[];
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemoveItem: (productId: string) => void;
    discount: number;
    onDiscountChange: (discount: number) => void;
}

export default function ShoppingCart({
    items,
    onUpdateQuantity,
    onRemoveItem,
    discount,
    onDiscountChange,
}: ShoppingCartProps) {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = discount;
    const total = Math.max(0, subtotal - discountAmount);

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Shopping Cart
            </h2>

            {/* Cart Items */}
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <p>Cart is empty</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div
                            key={item.productId}
                            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm text-gray-800">{item.name}</h4>
                                <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                            </div>

                            {/* Quantity Controls - Made More Obvious */}
                            <div className="flex flex-col items-center gap-0.5">
                                <span className="text-xs text-gray-400 font-medium">Qty</span>
                                <div className="flex items-center gap-1 bg-white rounded-md border border-gray-300 p-0.5">
                                    <button
                                        onClick={() => onUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                                        className="w-7 h-7 rounded-md bg-gray-100 hover:bg-red-100 hover:text-red-600 transition-colors flex items-center justify-center font-bold text-base cursor-pointer"
                                        disabled={item.quantity <= 1}
                                    >
                                        −
                                    </button>
                                    <span className="w-10 text-center font-bold text-base text-gray-900">{item.quantity}</span>
                                    <button
                                        onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                                        className="w-7 h-7 rounded-md bg-gray-100 hover:bg-green-100 hover:text-green-600 transition-colors flex items-center justify-center font-bold text-base cursor-pointer"
                                        disabled={item.quantity >= item.stockQuantity}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Item Total */}
                            <div className="text-right min-w-24">
                                <p className="font-bold text-gray-800 text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>

                            {/* Remove Button */}
                            <button
                                onClick={() => onRemoveItem(item.productId)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors flex items-center justify-center font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span className="font-semibold">-${discountAmount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span className="text-indigo-600">${total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}

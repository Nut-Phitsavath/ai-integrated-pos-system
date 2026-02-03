'use client';

import type { CartItem } from '@/types';

interface ShoppingCartProps {
    items: CartItem[];
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemoveItem: (productId: string) => void;
    discount: number;
    onDiscountChange: (discount: number) => void;
    taxRate?: number;
    taxAmount?: number;
}

export default function ShoppingCart({
    items,
    onUpdateQuantity,
    onRemoveItem,
    discount, // Added 'discount' to destructuring
    onDiscountChange,
    taxRate = 0,
    taxAmount = 0
}: ShoppingCartProps) {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = discount;
    const total = Math.max(0, subtotal - discountAmount) + taxAmount;

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
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Qty</span>
                                <div className="flex items-center gap-2 bg-white rounded-lg border-2 border-indigo-100 p-1 shadow-sm">
                                    <button
                                        onClick={() => onUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                                        className="w-8 h-8 rounded-md bg-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-transparent transition-all flex items-center justify-center font-bold text-lg cursor-pointer active:scale-95"
                                        disabled={item.quantity <= 1}
                                        aria-label="Decrease quantity"
                                    >
                                        −
                                    </button>
                                    <span className="w-8 text-center font-bold text-lg text-gray-900">{item.quantity}</span>
                                    <button
                                        onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                                        className="w-8 h-8 rounded-md bg-gray-300 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-transparent transition-all flex items-center justify-center font-bold text-lg cursor-pointer active:scale-95"
                                        disabled={item.quantity >= item.stockQuantity}
                                        aria-label="Increase quantity"
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
                {taxRate > 0 && (
                    <div className="flex justify-between text-gray-600">
                        <span>Tax ({taxRate}%):</span>
                        <span className="font-semibold">${taxAmount.toFixed(2)}</span>
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

import React from 'react';
import { Order, OrderItem } from '@/types';

interface ReceiptProps {
    order: any; // Using any for now to handle the expanded API response
    onPrint?: () => void;
    onClose?: () => void;
}

export default function Receipt({ order, onPrint, onClose }: ReceiptProps) {
    if (!order) return null;

    return (
        <div className="bg-white p-8 max-w-sm mx-auto shadow-none print:shadow-none font-mono text-sm leading-relaxed text-gray-900">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold uppercase mb-2 text-black">Smart POS</h1>
                <p className="text-gray-800 font-medium">123 Hardware Street</p>
                <p className="text-gray-800 font-medium">Cityville, ST 12345</p>
                <p className="text-gray-800 font-medium">(555) 123-4567</p>
            </div>

            {/* Order Info */}
            <div className="border-b-2 border-dashed border-gray-800 pb-4 mb-4">
                <div className="flex justify-between mb-1">
                    <span className="font-semibold">Order #:</span>
                    <span className="font-bold">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between mb-1">
                    <span className="font-semibold">Date:</span>
                    <span className="font-medium">{new Date(order.date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-1">
                    <span className="font-semibold">Cashier:</span>
                    <span className="font-medium">{order.user?.username || 'Staff'}</span>
                </div>
            </div>

            {/* Items */}
            <div className="border-b-2 border-dashed border-gray-800 pb-4 mb-4">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-gray-900 border-b border-gray-800">
                            <th className="pb-2 font-bold uppercase text-xs">Item</th>
                            <th className="pb-2 font-bold uppercase text-xs text-right">Qty</th>
                            <th className="pb-2 font-bold uppercase text-xs text-right">Price</th>
                            <th className="pb-2 font-bold uppercase text-xs text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-900">
                        {order.items.map((item: any) => (
                            <tr key={item.id}>
                                <td className="py-2 pr-2 font-medium">{item.product.name}</td>
                                <td className="py-2 text-right font-medium">{item.quantity}</td>
                                <td className="py-2 text-right font-medium">${item.price.toFixed(2)}</td>
                                <td className="py-2 text-right font-bold">${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="border-b-2 border-dashed border-gray-800 pb-4 mb-6 text-gray-900">
                <div className="flex justify-between mb-2">
                    <span className="font-bold">Subtotal:</span>
                    <span className="font-bold">${(order.totalAmount + order.discount).toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                    <div className="flex justify-between mb-2 text-gray-900">
                        <span className="font-bold">Discount:</span>
                        <span className="font-bold">-${order.discount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between text-xl font-black mt-4 border-t-2 border-gray-800 pt-2">
                    <span>TOTAL:</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                </div>

                {/* Payment Details */}
                <div className="mt-4 pt-2 border-t border-dashed border-gray-400 text-sm">
                    <div className="flex justify-between mb-1">
                        <span className="font-semibold">Payment:</span>
                        <span className="font-bold">{order.paymentMethod}</span>
                    </div>
                    {order.paymentMethod === 'CASH' && (
                        <>
                            <div className="flex justify-between mb-1">
                                <span>Tendered:</span>
                                <span>${order.amountPaid ? order.amountPaid.toFixed(2) : '-'}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                                <span>Change:</span>
                                <span>${order.change ? order.change.toFixed(2) : '-'}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-gray-900 mb-6">
                <p className="mb-2 font-bold">Thank you for your purchase!</p>
                <p className="text-xs font-medium uppercase">Please retain this receipt for returns.</p>
            </div>

            {/* Barcode (Mock) */}
            <div className="flex justify-center mb-6 opacity-70">
                <div className="h-12 w-48 bg-gray-800" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 10% 90%, 20% 100%, 30% 90%, 40% 100%, 50% 90%, 60% 100%, 70% 90%, 80% 100%, 90% 90%)' }}></div>
            </div>

            {/* Actions (Hidden on Print) */}
            <div className="print:hidden flex flex-col gap-2">
                <button
                    onClick={onPrint}
                    className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Receipt
                </button>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                    >
                        Close
                    </button>
                )}
            </div>
        </div>
    );
}

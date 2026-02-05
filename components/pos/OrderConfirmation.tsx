import React, { useState } from 'react';
import Receipt from './Receipt';

interface OrderConfirmationProps {
    order: any;
    isOpen: boolean;
    onClose: () => void;
}

export default function OrderConfirmation({ order, isOpen, onClose }: OrderConfirmationProps) {
    const [showReceipt, setShowReceipt] = useState(false);

    if (!isOpen || !order) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleNewSale = () => {
        setShowReceipt(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-all duration-300 ${showReceipt ? '' : 'transform scale-100'}`}>

                {showReceipt ? (
                    <div className="max-h-[85vh] overflow-y-auto">
                        <Receipt order={order} onPrint={handlePrint} onClose={handleNewSale} />
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        {/* Success Icon Animation */}
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Transaction Complete!</h2>
                        <p className="text-gray-500 mb-6">Order <span className="font-mono font-bold text-gray-700">{order.orderNumber}</span> has been processed successfully.</p>

                        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm space-y-2">
                            {/* Breakdown Calculations */}
                            {(() => {
                                const trueSubtotal = order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
                                const calculatedTax = order.totalAmount - (trueSubtotal - order.discount);

                                return (
                                    <>
                                        <div className="flex justify-between text-gray-500">
                                            <span>Subtotal</span>
                                            <span>${trueSubtotal.toFixed(2)}</span>
                                        </div>
                                        {order.discount > 0 && (
                                            <div className="flex justify-between text-gray-500">
                                                <span>Discount</span>
                                                <span>-${order.discount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-gray-500">
                                            <span>Tax</span>
                                            <span>${Math.max(0, calculatedTax).toFixed(2)}</span>
                                        </div>
                                        <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-bold text-gray-900 text-base">
                                            <span>Total Amount</span>
                                            <span>${order.totalAmount.toFixed(2)}</span>
                                        </div>

                                        <div className="border-t border-gray-200 my-2 pt-2"></div>

                                        <div className="flex justify-between text-gray-500">
                                            <span>Payment Method</span>
                                            <span className="font-medium text-gray-900">{order.paymentMethod}</span>
                                        </div>
                                        {order.paymentMethod === 'CASH' && (
                                            <div className="flex justify-between text-gray-500">
                                                <span>Cash Tendered</span>
                                                <span className="font-medium text-gray-900">${(order.amountPaid || 0).toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-gray-800 font-bold bg-green-50 p-2 rounded-lg mt-1">
                                            <span>Change Due</span>
                                            <span className="text-green-600">${(order.change || 0).toFixed(2)}</span>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => setShowReceipt(true)}
                                className="w-full py-3 bg-white border-2 border-indigo-600 text-indigo-700 rounded-xl hover:bg-indigo-50 font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                View Receipt
                            </button>

                            <button
                                onClick={handleNewSale}
                                className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg hover:shadow-xl transition-all"
                            >
                                Start New Sale
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalAmount: number;
    onComplete: (paymentMethod: string, amountPaid: number, change: number) => void;
}

export default function PaymentModal({ isOpen, onClose, totalAmount, onComplete }: PaymentModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'QR'>('CASH');
    const [amountPaid, setAmountPaid] = useState<string>('');
    const [change, setChange] = useState<number>(0);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setPaymentMethod('CASH');
            setAmountPaid('');
            setChange(0);
        }
    }, [isOpen]);

    // Calculate change whenever amountPaid updates
    useEffect(() => {
        if (paymentMethod === 'CASH') {
            const paid = parseFloat(amountPaid);
            if (!isNaN(paid) && paid >= totalAmount) {
                setChange(paid - totalAmount);
            } else {
                setChange(0);
            }
        } else {
            setChange(0);
        }
    }, [amountPaid, totalAmount, paymentMethod]);

    const handleQuickCash = (amount: number) => {
        setAmountPaid(amount.toString());
    };

    const handleSubmit = () => {
        let finalAmountPaid = parseFloat(amountPaid);

        // Validation
        if (paymentMethod === 'CASH') {
            if (isNaN(finalAmountPaid) || finalAmountPaid < totalAmount) {
                alert('Insufficient cash tendered.');
                return;
            }
        } else {
            // For Card/QR, assume exact payment
            finalAmountPaid = totalAmount;
        }

        onComplete(paymentMethod, finalAmountPaid, change);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Process Payment</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {/* Total Display */}
                    <div className="text-center mb-8">
                        <p className="text-sm text-gray-500 uppercase font-semibold tracking-wider mb-1">Total Amount</p>
                        <p className="text-5xl font-extrabold text-indigo-600">${totalAmount.toFixed(2)}</p>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        {['CASH', 'CARD', 'QR'].map((method) => (
                            <button
                                key={method}
                                onClick={() => setPaymentMethod(method as any)}
                                className={`py-3 px-4 rounded-xl font-bold transition-all duration-200 flex flex-col items-center gap-2 border-2 cursor-pointer ${paymentMethod === method
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
                                    }`}
                            >
                                {method === 'CASH' && (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                )}
                                {method === 'CARD' && (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                )}
                                {method === 'QR' && (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                    </svg>
                                )}
                                {method}
                            </button>
                        ))}
                    </div>

                    {/* Cash Interface */}
                    {paymentMethod === 'CASH' && (
                        <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Tendered</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                                    <input
                                        type="number"
                                        value={amountPaid}
                                        onChange={(e) => setAmountPaid(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-8 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 text-xl font-bold text-gray-900 transition-colors"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Quick Cash Buttons */}
                            <div className="flex gap-2 flex-wrap">
                                {[10, 20, 50, 100].map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => handleQuickCash(amount)}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                                    >
                                        ${amount}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handleQuickCash(Math.ceil(totalAmount))}
                                    className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                                >
                                    Exact (${Math.ceil(totalAmount)})
                                </button>
                            </div>

                            {/* Change Display */}
                            <div className="bg-gray-900 rounded-xl p-4 flex items-center justify-between text-white">
                                <span className="font-medium text-gray-300">Change Due</span>
                                <span className={`text-2xl font-bold ${change < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    ${change.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Card/QR Placeholders */}
                    {(paymentMethod === 'CARD' || paymentMethod === 'QR') && (
                        <div className="bg-gray-50 rounded-xl p-8 text-center animate-in slide-in-from-top-4 duration-300">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <svg className="w-8 h-8 text-indigo-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {paymentMethod === 'CARD' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                    )}
                                </svg>
                            </div>
                            <p className="text-gray-900 font-bold mb-1">Waiting for {paymentMethod === 'CARD' ? 'Terminal' : 'Scan'}...</p>
                            <p className="text-sm text-gray-500">Please process payment on the external device.</p>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={handleSubmit}
                        disabled={paymentMethod === 'CASH' && (parseFloat(amountPaid) < totalAmount || isNaN(parseFloat(amountPaid)))}
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        Confirm Payment
                    </button>
                </div>
            </div>
        </div>
    );
}

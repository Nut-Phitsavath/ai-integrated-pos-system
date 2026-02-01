import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function OrdersPage() {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    const orders = await prisma.order.findMany({
        where: {
            userId: session.user.id,
        },
        include: {
            items: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            date: 'desc',
        },
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <header className="bg-white shadow-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800">Order History</h1>
                        </div>
                        <a
                            href="/checkout"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Checkout
                        </a>
                    </div>
                </div>
            </header>

            {/* Orders List */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                        <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-xl font-semibold text-gray-600 mb-2">No orders yet</p>
                        <p className="text-gray-400">Complete your first transaction to see it here</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                {/* Order Header */}
                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800">Order #{order.orderNumber}</h3>
                                            <p className="text-sm text-gray-500">
                                                {new Date(order.date).toLocaleString('en-US', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">Total Amount</p>
                                            <p className="text-2xl font-bold text-indigo-600">
                                                ${Number(order.totalAmount).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="px-6 py-4">
                                    <div className="space-y-2">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-800">{item.product.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        ${Number(item.price).toFixed(2)} × {item.quantity}
                                                    </p>
                                                </div>
                                                <p className="font-bold text-gray-800">
                                                    ${(Number(item.price) * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Summary */}
                                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-1">
                                        {Number(order.discount) > 0 && (
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span>Discount Applied:</span>
                                                <span className="font-semibold">-${Number(order.discount).toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-gray-600">
                                            <span>Items:</span>
                                            <span className="font-semibold">{order.items.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

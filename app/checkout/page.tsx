'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import ProductGrid from '@/components/pos/ProductGrid';
import CategorySidebar from '@/components/pos/CategorySidebar';
import ShoppingCart from '@/components/pos/ShoppingCart';
import RecommendationWidget from '@/components/pos/RecommendationWidget';
import type { Product, CartItem } from '@/types';

export default function CheckoutPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [discount, setDiscount] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastOrderNumber, setLastOrderNumber] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const router = useRouter();

    const handleAddToCart = (product: Product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.productId === product.id);

            if (existingItem) {
                // Increase quantity if item already in cart
                if (existingItem.quantity < product.stockQuantity) {
                    return prevCart.map((item) =>
                        item.productId === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                }
                return prevCart;
            }

            // Add new item to cart
            return [
                ...prevCart,
                {
                    productId: product.id,
                    name: product.name,
                    price: Number(product.price),
                    quantity: 1,
                    stockQuantity: product.stockQuantity,
                },
            ];
        });
    };

    const handleUpdateQuantity = (productId: string, quantity: number) => {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.productId === productId ? { ...item, quantity } : item
            )
        );
    };

    const handleRemoveItem = (productId: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        setIsProcessing(true);

        try {
            const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const total = Math.max(0, subtotal - discount);

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    totalAmount: total,
                    discount,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to complete order');
            }

            const data = await response.json();
            setLastOrderNumber(data.order.orderNumber);

            // Clear cart and show success
            setCart([]);
            setDiscount(0);
            setShowSuccess(true);

            // Hide success message after 3 seconds
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error: any) {
            alert(error.message || 'Failed to complete checkout. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/login');
    };

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = Math.max(0, subtotal - discount);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <header className="bg-white shadow-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800">Smart POS System</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/orders')}
                                className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Order History
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-[1920px] mx-auto px-6 py-8">
                <div className="grid grid-cols-12 gap-6">
                    {/* Left Sidebar - Categories */}
                    <div className="col-span-12 lg:col-span-2">
                        <CategorySidebar
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                        />
                    </div>

                    {/* Center - Product Grid */}
                    <div className="col-span-12 lg:col-span-7">
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Browse Products</h2>
                            <ProductGrid onAddToCart={handleAddToCart} selectedCategory={selectedCategory} />
                        </div>
                    </div>

                    {/* Right Column - Cart & AI */}
                    <div className="col-span-12 lg:col-span-3 space-y-6">
                        {/* Shopping Cart */}
                        <ShoppingCart
                            items={cart}
                            onUpdateQuantity={handleUpdateQuantity}
                            onRemoveItem={handleRemoveItem}
                            discount={discount}
                            onDiscountChange={setDiscount}
                        />

                        {/* Checkout Button */}
                        <button
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || isProcessing}
                            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isProcessing ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing Transaction...
                                </span>
                            ) : (
                                `Complete Transaction - $${total.toFixed(2)}`
                            )}
                        </button>

                        {/* AI Recommendation */}
                        <RecommendationWidget cartItems={cart} onAddToCart={handleAddToCart} />
                    </div>
                </div>
            </main>

            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed top-8 right-8 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl animate-bounce z-50">
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <div>
                            <p className="font-bold">Order Completed!</p>
                            <p className="text-sm">Order #{lastOrderNumber}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import ProductGrid from '@/components/pos/ProductGrid';
import ProductSearch from '@/components/pos/ProductSearch';
import CategorySidebar from '@/components/pos/CategorySidebar';
import ShoppingCart from '@/components/pos/ShoppingCart';
import RecommendationWidget from '@/components/pos/RecommendationWidget';
import OrderConfirmation from '@/components/pos/OrderConfirmation';
import PaymentModal from '@/components/pos/PaymentModal';
import HeaderMenu from '@/components/layout/HeaderMenu';
import type { Product, CartItem } from '@/types';

export default function CheckoutPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [discount, setDiscount] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    // const [showSuccess, setShowSuccess] = useState(false); // Unused
    const [completedOrder, setCompletedOrder] = useState<any>(null);
    const [isOrderConfirmationOpen, setIsOrderConfirmationOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
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
                } else {
                    // Alert user if max stock reached
                    toast.error(`Cannot add more. Only ${product.stockQuantity} in stock.`);
                    return prevCart;
                }
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

    const [taxRate, setTaxRate] = useState(0);

    // Fetch settings on mount
    useState(() => {
        // This was causing the server-side error!
    });

    // Use useEffect for client-side data fetching
    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.taxRate) setTaxRate(data.taxRate);
            })
            .catch(err => console.error('Failed to load settings', err));
    }, []);

    // Global Keyboard Shortcuts
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F2') {
                e.preventDefault();
                document.getElementById('product-search-input')?.focus();
            } else if (e.key === 'F4') {
                if (cart.length > 0 && !isPaymentModalOpen && !isOrderConfirmationOpen) {
                    e.preventDefault();
                    handleCheckout();
                }
            } else if (e.key === 'Escape') {
                if (isPaymentModalOpen) setIsPaymentModalOpen(false);
                if (isOrderConfirmationOpen) handleCloseConfirmation();
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [cart.length, isPaymentModalOpen, isOrderConfirmationOpen]);

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

    const handleCheckout = () => {
        if (cart.length === 0) return;
        setIsPaymentModalOpen(true);
    };

    const handlePaymentComplete = async (paymentMethod: string, amountPaid: number, change: number) => {
        setIsPaymentModalOpen(false);
        setIsProcessing(true);

        try {
            const response = await fetch('/api/orders/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cartItems: cart,
                    discount,
                    paymentMethod,
                    amountPaid,
                    change
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to complete order');
            }

            const data = await response.json();
            setCompletedOrder(data.order);
            setIsOrderConfirmationOpen(true);

            // Clear cart
            setCart([]);
            setDiscount(0);
        } catch (error) {
            toast.error((error as any).message || 'Failed to complete checkout. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCloseConfirmation = () => {
        setIsOrderConfirmationOpen(false);
        setCompletedOrder(null);
    };

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/login');
    };

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxableAmount = Math.max(0, subtotal - discount);
    const taxAmount = taxableAmount * (taxRate / 100);
    const total = taxableAmount + taxAmount;

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <header className="bg-white shadow-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800">Smart POS System</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <HeaderMenu />
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors font-medium flex items-center gap-2 cursor-pointer border border-gray-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="hidden sm:inline">Logout</span>
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
                        {/* Search Bar */}
                        <div className="mb-6">
                            <ProductSearch onAddToCart={handleAddToCart} />
                        </div>

                        {/* Product Grid */}
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
                            taxRate={taxRate}
                            taxAmount={taxAmount}
                        />

                        {/* Checkout Button */}
                        <button
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || isProcessing}
                            className="w-full py-4 px-6 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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

            {/* Order Confirmation Modal */}
            <OrderConfirmation
                order={completedOrder}
                isOpen={isOrderConfirmationOpen}
                onClose={handleCloseConfirmation}
            />

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                totalAmount={total}
                onComplete={handlePaymentComplete}
            />
        </div>
    );
}

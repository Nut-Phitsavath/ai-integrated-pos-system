export interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    stockQuantity: number;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    description: string | null;
    stockQuantity: number;
    category: string | null;
}

export interface Order {
    id: string;
    orderNumber: string;
    date: Date;
    totalAmount: number;
    discount: number;
    items: OrderItem[];
}

export interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    product: {
        id: string;
        name: string;
    };
}

export interface RecommendationResponse {
    recommendation: Product | null;
    error?: string;
}

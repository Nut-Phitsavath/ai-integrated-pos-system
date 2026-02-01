import { NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { cartItems } = body;

        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json({ recommendation: null });
        }

        // Build prompt from cart items
        const itemsList = cartItems
            .map((item: any) => `${item.name} (${item.quantity}x)`)
            .join(', ');

        const prompt = `The customer is buying: ${itemsList}.
Based on these items, recommend ONE single product that would be a great upsell or cross-sell to improve sales.
Only respond with the product name, nothing else. Keep it simple and relevant.`;

        // Call Gemini API
        const result = await model.generateContent(prompt);
        const response = result.response;
        const recommendedProductName = response.text().trim();

        // Search for the product in the database
        const product = await prisma.product.findFirst({
            where: {
                name: {
                    contains: recommendedProductName,
                    mode: 'insensitive',
                },
                stockQuantity: {
                    gt: 0, // Only recommend if in stock
                },
            },
        });

        // If exact match not found, try fuzzy search
        let finalProduct = product;
        if (!finalProduct) {
            // Try searching for products not in the cart
            const cartProductIds = cartItems.map((item: any) => item.productId);

            const alternatives = await prisma.product.findMany({
                where: {
                    id: {
                        notIn: cartProductIds,
                    },
                    stockQuantity: {
                        gt: 0,
                    },
                },
                take: 5,
            });

            // Use the first alternative if available
            if (alternatives.length > 0) {
                finalProduct = alternatives[0];
            }
        }

        if (!finalProduct) {
            return NextResponse.json({ recommendation: null });
        }

        return NextResponse.json({
            recommendation: {
                id: finalProduct.id,
                name: finalProduct.name,
                price: Number(finalProduct.price),
                description: finalProduct.description,
                stockQuantity: finalProduct.stockQuantity,
                category: finalProduct.category,
            },
        });
    } catch (error: any) {
        console.error('Recommendation error:', error);

        // If Gemini API fails, return a fallback recommendation
        try {
            const fallbackProduct = await prisma.product.findFirst({
                where: {
                    stockQuantity: {
                        gt: 0,
                    },
                },
                orderBy: {
                    stockQuantity: 'desc',
                },
            });

            if (fallbackProduct) {
                return NextResponse.json({
                    recommendation: {
                        id: fallbackProduct.id,
                        name: fallbackProduct.name,
                        price: Number(fallbackProduct.price),
                        description: fallbackProduct.description,
                        stockQuantity: fallbackProduct.stockQuantity,
                        category: fallbackProduct.category,
                    },
                });
            }
        } catch (fallbackError) {
            console.error('Fallback recommendation error:', fallbackError);
        }

        return NextResponse.json(
            { error: 'Failed to generate recommendation', recommendation: null },
            { status: 500 }
        );
    }
}

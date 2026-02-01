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

        const prompt = `You are a helpful hardware store assistant. The customer is buying: ${itemsList}.

Based on what they're purchasing, recommend ONE complementary product that would be useful for their project.

Think about natural pairings:
- Paintbrushes → Paint
- Paint → Primer or Painter's Tape
- Drill → Drill bits or Safety glasses
- Lumber → Nails or Screws
- Cement → Sand or Mixing tools
- Electrical wire → Outlets or Wire nuts
- PVC pipes → PVC fittings or PVC cement
- Hand tools → Work gloves or Tool belt

Only recommend products from these categories: Power Tools, Hand Tools, Building Materials, Electrical, Plumbing, Paint, Safety, Hardware

Respond in this exact JSON format:
{
  "productName": "exact product name that would pair well",
  "reason": "brief explanation (1-2 sentences) of why this product complements their purchase and how it helps complete their project"
}`;

        // Call Gemini API
        const result = await model.generateContent(prompt);
        const response = result.response;
        const aiResponse = response.text().trim();

        // Parse JSON response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        const parsedResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

        if (!parsedResponse) {
            throw new Error('Invalid AI response format');
        }

        const recommendedProductName = parsedResponse.productName;
        const reason = parsedResponse.reason;

        // Search for the product in the database (removed mode: 'insensitive' for SQLite)
        const product = await prisma.product.findFirst({
            where: {
                name: {
                    contains: recommendedProductName,
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
                reason: reason || 'Great addition to your purchase',
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
                        reason: 'Popular item that might interest you',
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

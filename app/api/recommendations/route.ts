import { NextResponse } from 'next/server';
import { generateContentWithFallback } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    console.log('🔔 RECOMMENDATION API CALLED');
    try {
        const body = await request.json();
        const { cartItems } = body;

        console.log('Received cart items:', JSON.stringify(cartItems, null, 2));

        if (!cartItems || cartItems.length === 0) {
            console.log('No cart items, returning empty array');
            return NextResponse.json({ recommendations: [] });
        }

        // Generate recommendations for EACH cart item
        const recommendations = [];

        for (const cartItem of cartItems) {
            try {
                const prompt = `You are a helpful hardware store assistant. A customer just added "${cartItem.name}" to their cart.

Based on this specific product, recommend ONE complementary product that would be useful.

Think about natural pairings:
- Paint Roller → Paint or Painter's Tape
- Tape Measure → Pencil or Level
- Drill → Drill Bits or Safety Glasses
- Lumber → Nails or Screws
- Cement → Sand or Mixing Tools
- Electrical Wire → Wire Nuts or Electrical Tape
- PVC Pipe → PVC Cement or Fittings
- Hand Tools → Work Gloves or Tool Belt

Only recommend products from these categories: Power Tools, Hand Tools, Building Materials, Electrical, Plumbing, Paint, Safety, Hardware

Respond in this exact JSON format:
{
  "productName": "exact product name",
  "reason": "brief 1-sentence explanation of why this complements ${cartItem.name}"
}`;

                console.log(`🤖 Getting recommendation for: ${cartItem.name}`);
                const result = await generateContentWithFallback(prompt);
                const response = result.response;
                const aiResponse = response.text().trim();

                console.log(`✅ AI Response for ${cartItem.name}:`, aiResponse);

                // Parse JSON response
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    console.error(`❌ No JSON found for ${cartItem.name}`);
                    continue;
                }

                const parsedResponse = JSON.parse(jsonMatch[0]);

                if (!parsedResponse || !parsedResponse.productName) {
                    console.error(`❌ Invalid response for ${cartItem.name}`);
                    continue;
                }

                const recommendedProductName = parsedResponse.productName;
                const reason = parsedResponse.reason;

                // Search for the product in database
                const product = await prisma.product.findFirst({
                    where: {
                        name: { contains: recommendedProductName },
                        stockQuantity: { gt: 0 },
                        id: { notIn: cartItems.map((item: any) => item.productId) },
                    },
                });

                if (!product) {
                    // Try keyword search
                    const keywords = recommendedProductName.split(' ');
                    let altProduct = null;

                    for (const keyword of keywords) {
                        if (keyword.length < 3) continue;

                        altProduct = await prisma.product.findFirst({
                            where: {
                                name: { contains: keyword },
                                stockQuantity: { gt: 0 },
                                id: { notIn: cartItems.map((item: any) => item.productId) },
                            },
                        });

                        if (altProduct) break;
                    }

                    if (altProduct) {
                        console.log(`✅ Found alternative for ${cartItem.name}: ${altProduct.name}`);
                        recommendations.push({
                            product: {
                                id: altProduct.id,
                                name: altProduct.name,
                                price: Number(altProduct.price),
                                description: altProduct.description,
                                stockQuantity: altProduct.stockQuantity,
                                category: altProduct.category,
                            },
                            reason: reason || 'AI-recommended complementary product',
                            forItem: cartItem.name, // ATTRIBUTION!
                        });
                    }
                } else {
                    console.log(`✅ Found exact match for ${cartItem.name}: ${product.name}`);
                    recommendations.push({
                        product: {
                            id: product.id,
                            name: product.name,
                            price: Number(product.price),
                            description: product.description,
                            stockQuantity: product.stockQuantity,
                            category: product.category,
                        },
                        reason: reason || 'AI-recommended complementary product',
                        forItem: cartItem.name, // ATTRIBUTION!
                    });
                }
            } catch (itemError: any) {
                console.error(`Error processing ${cartItem.name}:`, itemError.message);
                continue;
            }
        }

        console.log(`📦 Returning ${recommendations.length} recommendations`);
        return NextResponse.json({ recommendations });

    } catch (error: any) {
        console.error('❌ Recommendation API failed:', error.message);
        return NextResponse.json({
            recommendations: [],
            error: 'AI recommendation service temporarily unavailable'
        });
    }
}

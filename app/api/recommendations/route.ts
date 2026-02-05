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
            console.log('No cart items, returning empty recommendation');
            return NextResponse.json({ recommendation: null });
        }

        // Construct a summary of the cart
        const cartSummary = cartItems.map((item: any) => `- ${item.name} (Qty: ${item.quantity})`).join('\n');

        const prompt = `You are an expert sales assistant at a hardware store / POS terminal.
The customer has the following items in their cart:
${cartSummary}

Based on this ENTIRE combination of items, recommend ONE single product that would be the best upsell or cross-sell.
Focus on "Project Logic" - what are they trying to build or fix? What did they forget?

Rules:
1. Recommend only ONE product.
2. Ensure it is NOT already in the cart.
3. It must be a physical product commonly found in a hardware/dept store.
4. Provide a brief "Pro Tip" that connects the items.

Respond in this exact JSON format:
{
  "productName": "exact product name",
  "reason": "brief explanation of why this completes their current project",
  "tip": "helpful advice for using these products together"
}`;

        console.log('🤖 Sending prompt to AI...');
        const result = await generateContentWithFallback(prompt);
        const response = result.response;
        const aiResponse = response.text().trim();
        console.log('🤖 AI Response:', aiResponse);

        // Parse JSON response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse JSON from AI response');
        }

        const parsedResponse = JSON.parse(jsonMatch[0]);
        const recommendedProductName = parsedResponse.productName;

        // Search for the product in database
        // We try to find the best match for the recommended name
        let product = await prisma.product.findFirst({
            where: {
                name: { contains: recommendedProductName },
                stockQuantity: { gt: 0 },
                id: { notIn: cartItems.map((item: any) => item.productId) },
            },
        });

        // Fallback: simple keyword search if exact match fails
        if (!product) {
            const keywords = recommendedProductName.split(' ').filter((w: string) => w.length > 3);
            for (const keyword of keywords) {
                product = await prisma.product.findFirst({
                    where: {
                        name: { contains: keyword },
                        stockQuantity: { gt: 0 },
                        id: { notIn: cartItems.map((item: any) => item.productId) },
                    },
                });
                if (product) break;
            }
        }

        let finalRecommendation = null;

        if (product) {
            finalRecommendation = {
                product: {
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    description: product.description,
                    stockQuantity: product.stockQuantity,
                    category: product.category,
                },
                reason: parsedResponse.reason,
                tip: parsedResponse.tip
            };
        } else {
            // If we can't find the product, we can still return the tip/reason but without a product link
            // Or we just return nothing to avoid confusion.
            // Requirement says: "The system will then check if this recommended item exists... before displaying it."
            // So if not found, we return null.
            console.log(`❌ Recommended product "${recommendedProductName}" not found in stock.`);
            return NextResponse.json({ recommendation: null });
        }

        return NextResponse.json({ recommendation: finalRecommendation });

    } catch (error: any) {
        console.error('❌ Recommendation API failed:', error.message);
        return NextResponse.json({
            recommendation: null,
            error: 'AI recommendation service temporarily unavailable'
        });
    }
}

import { NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    console.log('🔔 RECOMMENDATION API CALLED');
    try {
        const body = await request.json();
        const { cartItems } = body;

        console.log('Received cart items:', JSON.stringify(cartItems, null, 2));

        if (!cartItems || cartItems.length === 0) {
            console.log('No cart items, returning null');
            return NextResponse.json({ recommendation: null });
        }

        // Format cart items for AI
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

        // Call Gemini AI - NO FALLBACK!
        console.log('🤖 Calling Gemini 2.5 Flash AI...');
        const result = await model.generateContent(prompt);
        const response = result.response;
        const aiResponse = response.text().trim();

        console.log('✅ AI Response:', aiResponse);

        // Parse JSON response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('❌ No JSON found in AI response');
            throw new Error('AI did not return valid JSON');
        }

        const parsedResponse = JSON.parse(jsonMatch[0]);
        console.log('📦 Parsed:', parsedResponse);

        if (!parsedResponse || !parsedResponse.productName) {
            console.error('❌ Invalid response structure');
            throw new Error('AI response missing productName');
        }

        const recommendedProductName = parsedResponse.productName;
        const reason = parsedResponse.reason;

        console.log('🔍 Looking for product:', recommendedProductName);

        // Search for the AI-recommended product in database
        const product = await prisma.product.findFirst({
            where: {
                name: { contains: recommendedProductName },
                stockQuantity: { gt: 0 },
                id: { notIn: cartItems.map((item: any) => item.productId) },
            },
        });

        if (!product) {
            console.log('⚠️ AI suggested product not found in inventory:', recommendedProductName);
            // Try a looser search with key words
            const keywords = recommendedProductName.split(' ');
            for (const keyword of keywords) {
                if (keyword.length < 3) continue; // Skip short words

                const altProduct = await prisma.product.findFirst({
                    where: {
                        name: { contains: keyword },
                        stockQuantity: { gt: 0 },
                        id: { notIn: cartItems.map((item: any) => item.productId) },
                    },
                });

                if (altProduct) {
                    console.log('✅ Found alternative match:', altProduct.name);
                    return NextResponse.json({
                        recommendation: {
                            id: altProduct.id,
                            name: altProduct.name,
                            price: Number(altProduct.price),
                            description: altProduct.description,
                            stockQuantity: altProduct.stockQuantity,
                            category: altProduct.category,
                            reason: reason || 'AI-recommended complementary product',
                        },
                    });
                }
            }

            // Product genuinely not found
            return NextResponse.json({
                recommendation: null,
                message: 'AI suggestion not available in stock'
            });
        }

        console.log('✅ AI RECOMMENDATION SUCCESS:', product.name);
        return NextResponse.json({
            recommendation: {
                id: product.id,
                name: product.name,
                price: Number(product.price),
                description: product.description,
                stockQuantity: product.stockQuantity,
                category: product.category,
                reason: reason || 'AI-recommended complementary product',
            },
        });

    } catch (error: any) {
        console.error('❌ AI Recommendation failed:', error.message);
        // Return null instead of fallback
        return NextResponse.json({
            recommendation: null,
            error: 'AI recommendation service temporarily unavailable'
        });
    }
}

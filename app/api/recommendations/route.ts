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

        // 1. Fetch ALL available inventory (name, id, category) to constrain the AI
        // Limit to 100 items to keep prompt size reasonable, prioritizing high stock or relevant categories if possible.
        // For now, valid stock items.
        const availableProducts = await prisma.product.findMany({
            where: {
                stockQuantity: { gt: 0 },
                id: { notIn: cartItems.map((item: any) => item.productId) }
            },
            select: {
                id: true,
                name: true,
                category: true,
                price: true
            },
            take: 100 // Safety limit for tokens
        });

        if (availableProducts.length === 0) {
            console.log('No other products available in stock');
            return NextResponse.json({ recommendation: null });
        }

        // Create a compact list for the prompt
        const inventoryList = availableProducts.map(p => `- [${p.id}] ${p.name} ($${p.price}) (${p.category})`).join('\n');
        const cartSummary = cartItems.map((item: any) => `- ${item.name} (Qty: ${item.quantity})`).join('\n');

        const prompt = `You are an expert sales assistant at a hardware store.
The customer has the following items in their cart:
${cartSummary}

We have the following items IN STOCK (Inventory):
${inventoryList}

TASK:
Based on the customer's cart, select the SINGLE BEST product from the "Inventory" list to recommend.
Focus on "Project Logic" - what are they trying to build or fix? What essential item from OUR INVENTORY is missing?

RULES:
1. You MUST select a product ID from the provided Inventory list.
2. If NO item in the inventory is relevant to their project, return null. Do not force a bad recommendation.
3. Provide a brief "Pro Tip".

Respond in this exact JSON format:
{
  "found": true,
  "productId": "id from inventory list",
  "productName": "name from inventory list",
  "reason": "brief explanation",
  "tip": "helpful advice"
}
OR if nothing is relevant:
{
  "found": false
}`;

        console.log('🤖 Sending prompt to AI with inventory context...');
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

        if (!parsedResponse.found || !parsedResponse.productId) {
            console.log('AI could not find a relevant product in inventory.');
            return NextResponse.json({ recommendation: null });
        }

        // Verify the product exists (double check)
        const product = await prisma.product.findUnique({
            where: { id: parsedResponse.productId }
        });

        if (!product || product.stockQuantity <= 0) {
            console.log('AI recommended product not found or out of stock (race condition).');
            return NextResponse.json({ recommendation: null });
        }

        const finalRecommendation = {
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

        return NextResponse.json({ recommendation: finalRecommendation });

    } catch (error: any) {
        console.error('❌ Recommendation API failed:', error.message);
        return NextResponse.json({
            recommendation: null,
            error: 'AI recommendation service temporarily unavailable'
        });
    }
}

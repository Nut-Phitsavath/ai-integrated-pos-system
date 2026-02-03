import { NextResponse } from 'next/server';
import { generateContentWithFallback } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch high-level stats for context
        const now = new Date();
        const startOf30DaysAgo = new Date(now);
        startOf30DaysAgo.setDate(now.getDate() - 30);

        const orders = await prisma.order.findMany({
            where: {
                date: { gte: startOf30DaysAgo }
            },
            select: {
                date: true,
                totalAmount: true,
                items: {
                    select: {
                        product: { select: { name: true, category: true } }
                    }
                }
            }
        });

        if (orders.length < 5) {
            return NextResponse.json({ insights: ["Not enough data yet to generate insights. Keep selling!"] });
        }

        // Simple aggregation for the prompt
        const totalSales = orders.reduce((acc, o) => acc + o.totalAmount, 0);
        const avgOrder = totalSales / orders.length;

        // Find busiest day of week
        const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
        orders.forEach(o => dayCounts[new Date(o.date).getDay()]++);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const busiestDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
        const busiestDay = days[busiestDayIndex];

        const prompt = `You are a business analytics assistant for a small retail store.
Here is the data for the last 30 days:
- Total Revenue: $${totalSales.toFixed(2)}
- Total Orders: ${orders.length}
- Average Order Value: $${avgOrder.toFixed(2)}
- Busiest Day of Week: ${busiestDay}

Based on this, generate 2-3 short, specific, and actionable business insights or observations.
Focus on trends, opportunities, or interesting patterns.
Keep each insight under 15 words.
Return ONLY valid JSON string array: ["Insight 1", "Insight 2"]`;

        const result = await generateContentWithFallback(prompt);
        const text = result.response.text();

        // Parse JSON
        const jsonMatch = text.match(/\[.*\]/s);
        const insights = jsonMatch ? JSON.parse(jsonMatch[0]) : ["Sales are looking good!"];

        return NextResponse.json({ insights });

    } catch (error: any) {
        console.error('Insights API error:', error);
        return NextResponse.json({ insights: ["Unable to generate insights right now."] });
    }
}

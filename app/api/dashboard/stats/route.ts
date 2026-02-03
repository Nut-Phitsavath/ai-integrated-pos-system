import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOf7DaysAgo = new Date(now);
        startOf7DaysAgo.setDate(now.getDate() - 7);
        startOf7DaysAgo.setHours(0, 0, 0, 0);

        // 1. Total Revenue & Order Count
        const aggregations = await prisma.order.aggregate({
            _sum: {
                totalAmount: true,
            },
            _count: {
                id: true,
            },
        });

        const totalRevenue = aggregations._sum.totalAmount || 0;
        const totalOrders = aggregations._count.id || 0;

        // 2. Top Selling Products
        // Group by productId in OrderItem to find most sold items
        const topProductsRaw = await prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true,
            },
            orderBy: {
                _sum: {
                    quantity: 'desc',
                },
            },
            take: 5,
        });

        // Fetch product details for these IDs
        const topProducts = await Promise.all(topProductsRaw.map(async (item) => {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: { name: true, price: true }
            });
            return {
                id: item.productId,
                name: product?.name || 'Unknown Product',
                quantity: item._sum.quantity,
                revenue: (product?.price || 0) * (item._sum.quantity || 0),
            };
        }));

        // 3. Recent Orders (limit 5)
        const recentOrders = await prisma.order.findMany({
            take: 5,
            orderBy: { date: 'desc' },
            include: {
                user: { select: { username: true } },
                items: { include: { product: true } }
            }
        });

        // 4. Revenue Graph Data (Last 7 Days)
        // Get orders from last 7 days
        const revenues = await prisma.order.groupBy({
            by: ['date'],
            where: {
                date: {
                    gte: startOf7DaysAgo,
                },
            },
            _sum: {
                totalAmount: true,
            },
        });

        // SQLite stores dates as strings properly if we use ISO, but GroupBy on date might be tricky with full timestamps.
        // Easier approach for SQLite/General compatibility: Fetch all orders for 7 days and aggregate in JS.
        const ordersLast7Days = await prisma.order.findMany({
            where: {
                date: {
                    gte: startOf7DaysAgo,
                }
            },
            select: {
                date: true,
                totalAmount: true,
            }
        });

        // Initialize last 7 days map
        const revenueMap = new Map<string, number>();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            revenueMap.set(dateStr, 0);
        }

        const hourlyMap = new Array(24).fill(0);

        ordersLast7Days.forEach(order => {
            // Daily Revenue
            const dateStr = new Date(order.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            if (revenueMap.has(dateStr)) {
                revenueMap.set(dateStr, (revenueMap.get(dateStr) || 0) + order.totalAmount);
            }

            // Hourly Traffic (using local time of the server/db)
            const hour = new Date(order.date).getHours();
            hourlyMap[hour]++;
        });

        const revenueGraphData = Array.from(revenueMap.entries()).map(([date, revenue]) => ({
            date,
            revenue
        }));

        const hourlyTraffic = hourlyMap.map((count, hour) => ({
            hour,
            count
        }));


        return NextResponse.json({
            stats: {
                totalRevenue,
                totalOrders,
                averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
            },
            topProducts,
            recentOrders,
            revenueGraphData,
            hourlyTraffic
        });

    } catch (error: any) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}

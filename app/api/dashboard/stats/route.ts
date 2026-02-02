import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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

        return NextResponse.json({
            stats: {
                totalRevenue,
                totalOrders,
                averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
            },
            topProducts,
            recentOrders
        });

    } catch (error: any) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}

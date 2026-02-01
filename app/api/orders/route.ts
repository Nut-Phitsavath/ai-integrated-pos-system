import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orders = await prisma.order.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
        });

        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Get orders error:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { items, totalAmount, discount } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'Invalid order items' }, { status: 400 });
        }

        // Generate order number
        const orderCount = await prisma.order.count();
        const orderNumber = `ORD-${String(orderCount + 1).padStart(5, '0')}`;

        // Start transaction to ensure data consistency
        const order = await prisma.$transaction(async (tx) => {
            // Verify stock and create order items
            for (const item of items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });

                if (!product) {
                    throw new Error(`Product ${item.productId} not found`);
                }

                if (product.stockQuantity < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}`);
                }

                // Update stock quantity
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stockQuantity: product.stockQuantity - item.quantity,
                    },
                });
            }

            // Create order with items
            return tx.order.create({
                data: {
                    orderNumber,
                    totalAmount,
                    discount: discount || 0,
                    userId: session.user.id,
                    items: {
                        create: items.map((item: any) => ({
                            quantity: item.quantity,
                            price: item.price,
                            productId: item.productId,
                        })),
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
        });

        return NextResponse.json({ order }, { status: 201 });
    } catch (error: any) {
        console.error('Create order error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create order' },
            { status: 500 }
        );
    }
}

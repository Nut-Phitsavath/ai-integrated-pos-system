import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random
    return `ORD-${year}${month}${day}-${random}`;
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { cartItems, discount = 0, paymentMethod = 'CASH', amountPaid = 0, change = 0 } = body;

        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        // Calculate total on server side for security
        let calculatedTotal = 0;

        // 1. Verify stock and calculate total
        for (const item of cartItems) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId }
            });

            if (!product) {
                return NextResponse.json({ error: `Product not found: ${item.name}` }, { status: 404 });
            }

            if (product.stockQuantity < item.quantity) {
                return NextResponse.json({
                    error: `Insufficient stock for ${item.name}. Available: ${product.stockQuantity}`
                }, { status: 400 });
            }

            calculatedTotal += product.price * item.quantity;
        }

        // 2. Fetch Tax Settings
        const settings = await prisma.storeSettings.findFirst();
        const taxRate = settings?.taxRate || 0;

        // 3. Apply Discount and Tax
        const subtotalAfterDiscount = Math.max(0, calculatedTotal - discount);
        const taxAmount = subtotalAfterDiscount * (taxRate / 100);
        const finalTotal = subtotalAfterDiscount + taxAmount;

        // Validate payment amount (allow small floating point difference)
        if (amountPaid < finalTotal - 0.01) {
            return NextResponse.json({
                error: `Insufficient payment amount. Total is ${finalTotal.toFixed(2)}`
            }, { status: 400 });
        }

        const orderNumber = generateOrderNumber();

        // 4. Process transaction (create order, items, update stock)
        const order = await prisma.$transaction(async (tx) => {
            // Create Order
            const newOrder = await tx.order.create({
                data: {
                    orderNumber,
                    totalAmount: finalTotal,
                    discount,
                    paymentMethod,
                    amountPaid,
                    change,
                    userId: session.user.id,
                }
            });

            // Creates OrderItems and Update Products
            for (const item of cartItems) {
                // Determine price to store (using current product price)
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product) throw new Error(`Product ${item.id} not found`);

                await tx.orderItem.create({
                    data: {
                        quantity: item.quantity,
                        price: product.price,
                        orderId: newOrder.id,
                        productId: item.productId
                    }
                });

                // Decrement stock
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stockQuantity: {
                            decrement: item.quantity
                        }
                    }
                });
            }

            return newOrder;
        });

        // 5. Fetch full order details to return
        const fullOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                user: {
                    select: {
                        username: true
                    }
                }
            }
        });

        return NextResponse.json({ success: true, order: fullOrder });

    } catch (error: any) {
        console.error('Order completion error:', error);
        return NextResponse.json(
            { error: 'Failed to process order', details: error.message },
            { status: 500 }
        );
    }
}

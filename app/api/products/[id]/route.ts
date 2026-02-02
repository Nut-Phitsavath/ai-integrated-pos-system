import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { price, stockQuantity } = body;

        // Validate input
        if (price !== undefined && typeof price !== 'number') {
            return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
        }
        if (stockQuantity !== undefined && typeof stockQuantity !== 'number') {
            return NextResponse.json({ error: 'Invalid stock quantity' }, { status: 400 });
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                ...(price !== undefined && { price }),
                ...(stockQuantity !== undefined && { stockQuantity }),
            },
        });

        return NextResponse.json({ product: updatedProduct }, { status: 200 });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.product.delete({
            where: { id },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}

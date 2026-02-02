import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        const where = category ? { category } : {};

        const products = await prisma.product.findMany({
            where,
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Get products error:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, category, price, stockQuantity, imageUrl, description } = body;

        // Validation
        if (!name || typeof price !== 'number' || typeof stockQuantity !== 'number') {
            return NextResponse.json(
                { error: 'Name, price and stock are required' },
                { status: 400 }
            );
        }

        const product = await prisma.product.create({
            data: {
                name,
                category: category || 'Uncategorized',
                price,
                stockQuantity,
                imageUrl,
                description,
            },
        });

        return NextResponse.json({ product }, { status: 201 });
    } catch (error) {
        console.error('Create product error:', error);
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}

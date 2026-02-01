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

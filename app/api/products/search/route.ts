import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json({ products: [] });
        }

        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { id: { contains: query } },
                    { category: { contains: query } },
                ],
            },
            take: 10,
        });

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Product search error:', error);
        return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
    }
}

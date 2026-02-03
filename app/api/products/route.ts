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

import { auth } from '@/lib/auth';
import { z } from 'zod';

const createProductSchema = z.object({
    name: z.string().min(1, "Name is required"),
    category: z.string().optional(),
    price: z.number().min(0, "Price must be positive"),
    stockQuantity: z.number().int().min(0, "Stock must be non-negative"),
    imageUrl: z.string().url().optional().or(z.literal('')),
    description: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const session = await auth();

        // 1. Auth Check
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Role Check (Admin Only)
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const body = await req.json();

        // 3. Zod Validation
        const result = createProductSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation Error', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { name, category, price, stockQuantity, imageUrl, description } = result.data;

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

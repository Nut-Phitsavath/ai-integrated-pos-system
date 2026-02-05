import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const settings = await prisma.storeSettings.findFirst();

        if (!settings) {
            // Default fallback if not in DB yet (though SQL script should have added it)
            return NextResponse.json({
                storeName: 'Smart POS',
                address: '123 Store St',
                taxRate: 0,
                currency: '$',
                phone: ''
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Settings GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { storeName, address, phone, taxRate, currency } = body;

        // Upsert: Update ID 1 if exists, otherwise create ID 1
        const settings = await prisma.storeSettings.upsert({
            where: { id: 1 },
            update: {
                storeName,
                address,
                phone,
                taxRate: parseFloat(taxRate),
                currency
            },
            create: {
                id: 1,
                storeName,
                address,
                phone,
                taxRate: parseFloat(taxRate),
                currency
            }
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Settings POST error:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}

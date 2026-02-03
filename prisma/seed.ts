import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error('❌ DATABASE_URL is not defined');
    process.exit(1);
}

// Initialize LibSQL adapter exactly as in lib/prisma.ts
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });




async function main() {
    console.log('🌱 Starting database seed...');

    const passwordHash = await bcrypt.hash('password123', 10);

    // 0. Cleanup handled by separate script
    // ... skipping legacy cleanup in this seed file ...

    // 1. Create Owner (Admin)
    const owner = await prisma.user.upsert({
        where: { username: 'owner' },
        update: {},
        create: {
            username: 'owner',
            password: passwordHash,
            role: 'ADMIN',
        },
    });
    console.log('✅ Created user: owner (ADMIN)');

    // 2. Create Manager
    const manager = await prisma.user.upsert({
        where: { username: 'manager' },
        update: {},
        create: {
            username: 'manager',
            password: passwordHash,
            role: 'MANAGER',
        },
    });
    console.log('✅ Created user: manager (MANAGER)');

    // 3. Create Cashier (POS Officer)
    const cashier = await prisma.user.upsert({
        where: { username: 'cashier' },
        update: {},
        create: {
            username: 'cashier',
            password: passwordHash,
            role: 'POS_OFFICER',
        },
    });
    console.log('✅ Created user: cashier (POS_OFFICER)');

    // Create detailed inventory matching store categories
    const products = [
        // Paint
        { name: 'Primer Sealer Gallon', price: 24.99, description: 'Universal primer and sealer for all surfaces', stockQuantity: 65, category: 'Paint' },
        { name: 'Interior Latex Paint White 1G', price: 32.50, description: 'Eggshell finish interior paint', stockQuantity: 40, category: 'Paint' },
        { name: 'Exterior Acrylic Paint 1G', price: 38.99, description: 'Weather-resistant exterior paint', stockQuantity: 35, category: 'Paint' },
        { name: 'Paint Roller Set 9"', price: 12.99, description: 'Roller frame, 2 covers, and tray', stockQuantity: 50, category: 'Paint' },
        { name: 'Painters Tape 2"', price: 6.49, description: 'Blue masking tape for clean lines', stockQuantity: 100, category: 'Paint' },

        // Safety
        { name: 'Safety Glasses', price: 9.99, description: 'ANSI rated impact resistant glasses', stockQuantity: 120, category: 'Safety' },
        { name: 'Work Gloves Leather', price: 14.99, description: 'Heavy-duty leather work gloves, Large', stockQuantity: 60, category: 'Safety' },
        { name: 'Dust Mask N95 (3-Pack)', price: 7.99, description: 'Respirator masks for sanding and drywall', stockQuantity: 200, category: 'Safety' },
        { name: 'Hard Hat Yellow', price: 18.50, description: 'OSHA approved adjustable hard hat', stockQuantity: 30, category: 'Safety' },

        // Hardware
        { name: 'Nails Framing 5lb', price: 18.99, description: '16d common framing nails box', stockQuantity: 110, category: 'Hardware' },
        { name: 'Screws Deck 1lb', price: 12.99, description: 'Coated exterior deck screws 2.5"', stockQuantity: 130, category: 'Hardware' },
        { name: 'Drywall Screws 5lb', price: 22.99, description: 'Coarse thread drywall screws 1-5/8"', stockQuantity: 90, category: 'Hardware' },
        { name: 'Duct Tape Heavy Duty', price: 7.99, description: 'Industrial strength duct tape silver', stockQuantity: 140, category: 'Hardware' },

        // Hand Tools
        { name: 'Hammer Claw 16oz', price: 15.99, description: 'Fiberglass handle claw hammer', stockQuantity: 45, category: 'Hand Tools' },
        { name: 'Tape Measure 25ft', price: 11.99, description: 'Locking tape measure english/metric', stockQuantity: 60, category: 'Hand Tools' },
        { name: 'Torpedo Level 9"', price: 12.99, description: 'Magnetic torpedo level', stockQuantity: 35, category: 'Hand Tools' },
        { name: 'Screwdriver Set 6pc', price: 19.99, description: 'Phillips and flathead screwdriver set', stockQuantity: 40, category: 'Hand Tools' },
        { name: 'Utility Knife', price: 6.99, description: 'Retractable heavy duty blade utility knife', stockQuantity: 85, category: 'Hand Tools' },

        // Power Tools
        { name: 'Cordless Drill 18V', price: 89.99, description: 'Drill/Driver with battery and charger', stockQuantity: 12, category: 'Power Tools' },
        { name: 'Circular Saw 7-1/4"', price: 129.00, description: '15 Amp corded circular saw with blade', stockQuantity: 8, category: 'Power Tools' },
        { name: 'Drill Bit Set 20pc', price: 24.99, description: 'Titanium coated drill bits', stockQuantity: 30, category: 'Power Tools' },

        // Building Materials
        { name: 'Lumber 2x4x8', price: 6.50, description: 'Premium kiln-dried stud', stockQuantity: 200, category: 'Building Materials' },
        { name: 'Plywood 1/2" 4x8', price: 34.00, description: 'CDX sheathing plywood', stockQuantity: 50, category: 'Building Materials' },
        { name: 'Drywall Sheet 4x8', price: 14.50, description: 'UltraLight drywall panel', stockQuantity: 80, category: 'Building Materials' },
        { name: 'Concrete Mix 80lb', price: 5.95, description: 'High-strength concrete mix', stockQuantity: 60, category: 'Building Materials' },

        // Plumbing
        { name: 'PVC Glue 4oz', price: 5.49, description: 'PVC cement clear medium body', stockQuantity: 50, category: 'Plumbing' },
        { name: 'Teflon Tape', price: 1.25, description: 'Plumbers thread seal tape', stockQuantity: 150, category: 'Plumbing' },
        { name: 'Pipe Wrench 14"', price: 22.50, description: 'Cast iron pipe wrench', stockQuantity: 15, category: 'Plumbing' },

        // Electrical
        { name: 'Wire Stripper', price: 14.99, description: 'Electrical wire stripper and cutter', stockQuantity: 30, category: 'Electrical' },
        { name: 'Electrical Tape Black', price: 2.99, description: 'Vinyl electrical tape', stockQuantity: 100, category: 'Electrical' },
        { name: 'Extension Cord 50ft', price: 34.99, description: 'Outdoor heavy duty extension cord', stockQuantity: 25, category: 'Electrical' },
    ];

    const createdProducts: Record<string, any> = {};

    for (const product of products) {
        // Find existing by name to avoid duplicates if re-running without clean, or just create
        // Since we are cleaning, upsert is fine, but we won't provide ID.
        // Wait, Upsert requires a "where" unique field. ID or Name. 
        // Product schema has @@index([name]), but name is not @unique in schema!
        // So we can't use upsert by name. We should use create, or if we want to be safe, findFirst then create?
        // Since we are wiping DB, create is safe.
        // Actually, if we want to support re-seeding without wipe, we'd need a unique identifier. 
        // But standard CUIDs change every time. 
        // Let's just use createMany or loop create.

        // IMPORTANT: We need the IDs for the order.
        const p = await prisma.product.create({
            data: product
        });
        createdProducts[product.name] = p;
    }

    console.log(`✅ Created ${products.length} products with standard IDs`);

    // Create a sample order for the Cashier
    // We need to look up the products we just created to get their dynamic IDs
    const getProductId = (name: string) => createdProducts[name]?.id;

    if (!getProductId('Hammer Claw 16oz')) {
        console.warn('⚠️ Could not find products for sample order, skipping order creation.');
    } else {
        const sampleOrder = await prisma.order.create({
            data: {
                orderNumber: 'ORD-001',
                totalAmount: 1042.97,
                discount: 50.00,
                userId: cashier.id,
                items: {
                    create: [
                        {
                            quantity: 1,
                            price: 15.99,
                            productId: getProductId('Hammer Claw 16oz'),
                        },
                        {
                            quantity: 1,
                            price: 9.99,
                            productId: getProductId('Safety Glasses'),
                        },
                        {
                            quantity: 2,
                            price: 7.99,
                            productId: getProductId('Duct Tape Heavy Duty'),
                        },
                    ],
                },
            },
        });
        console.log('✅ Created sample order:', sampleOrder.orderNumber);
    }

    console.log('🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL is not defined');

const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🧹 Starting deep cleanup (FULL WIPE)...');

    // Delete in order to respect constraints:
    // 1. Orders (cascades to OrderItems)
    console.log('🗑️ Deleting all Orders...');
    await prisma.order.deleteMany({});

    // 2. Products (now safe to delete since no orders reference them)
    // Note: If OrderItem->Product relation is mandatory, deleting orders first is required.
    console.log('🗑️ Deleting all Products...');
    await prisma.product.deleteMany({});

    // 3. Users
    console.log('🗑️ Deleting all Users...');
    await prisma.user.deleteMany({});

    console.log('\n🎉 Database completely wiped!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

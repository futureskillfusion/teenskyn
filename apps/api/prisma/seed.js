import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRODUCTS_SHOT = 'https://horizons-cdn.hostinger.com/0ee21065-9453-420a-8612-dba671feedfb/8cc8f64d46ba18641957e60883c20c34.png';

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in apps/api/.env before seeding');
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash, name: 'Teen Skyn Admin' },
  });
  console.log(`Admin user ready: ${adminEmail}`);

  let category = await prisma.category.findUnique({ where: { slug: 'skincare-essentials' } });
  if (!category) {
    category = await prisma.category.create({
      data: { title: 'Skincare Essentials', slug: 'skincare-essentials', order: 0 },
    });
  }
  console.log(`Category ready: ${category.title}`);

  const seedProducts = [
    {
      title: 'Foam Wash',
      subtitle: '40 ml · Cleanse • Refresh',
      description: 'A cloud-soft foam that lifts oil, sweat and sunscreen without stripping young skin. Fragrance-free and pH balanced.',
      priceInCents: 5800,
    },
    {
      title: 'Day Moisturiser',
      subtitle: '30 ml · Hydrate • Protect',
      description: 'Lightweight hydration that sits happily under school, sport and screen time. Never greasy, never heavy.',
      priceInCents: 6800,
    },
    {
      title: 'Night Serum',
      subtitle: '20 ml · Repair • Renew',
      description: 'Overnight repair with gentle niacinamide to calm breakouts and even out marks by morning.',
      priceInCents: 7800,
    },
  ];

  for (const [index, p] of seedProducts.entries()) {
    const existing = await prisma.product.findFirst({ where: { title: p.title } });
    if (existing) {
      console.log(`Product already exists, skipping: ${p.title}`);
      continue;
    }

    await prisma.product.create({
      data: {
        title: p.title,
        subtitle: p.subtitle,
        description: p.description,
        thumbnailUrl: PRODUCTS_SHOT,
        purchasable: true,
        order: index,
        status: 'active',
        categoryId: category.id,
        images: { create: [{ url: PRODUCTS_SHOT, order: 0 }] },
        variants: {
          create: [{
            title: 'Default Variant',
            priceInCents: p.priceInCents,
            currency: 'myr',
            manageInventory: true,
            inventoryQuantity: 100,
          }],
        },
      },
    });
    console.log(`Product created: ${p.title}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

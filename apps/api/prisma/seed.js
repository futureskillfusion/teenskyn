import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma.js';

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

  const seedServices = [
    { title: 'Teen Clarity Facial', durationText: '45 min', priceText: 'RM55', description: 'Deep cleanse, steam and gentle extractions for congested skin.' },
    { title: 'First Facial (12-14)', durationText: '30 min', priceText: 'RM38', description: 'A soft intro treatment plus a routine walkthrough with a parent.' },
    { title: 'Breakout Rescue', durationText: '60 min', priceText: 'RM70', description: 'Targeted acne treatment with LED light and calming mask.' },
    { title: 'Glow Up Peel', durationText: '40 min', priceText: 'RM65', description: 'Mild enzyme peel for dull skin and post-breakout marks.' },
    { title: 'Brow Shape & Tint', durationText: '25 min', priceText: 'RM28', description: 'Soft natural shaping designed for growing faces.' },
    { title: 'Skyn Coaching Session', durationText: '30 min', priceText: 'Free with facial', description: 'One-on-one routine building, product matching, zero judgement.' },
  ];

  for (const [index, svc] of seedServices.entries()) {
    const existing = await prisma.service.findFirst({ where: { title: svc.title } });
    if (existing) {
      console.log(`Service already exists, skipping: ${svc.title}`);
      continue;
    }
    await prisma.service.create({ data: { ...svc, order: index } });
    console.log(`Service created: ${svc.title}`);
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

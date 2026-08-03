import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { normalizeProduct } from '../../utils/normalize.js';
import { listPublicProducts, countPublicProducts, getPublicProduct } from '../../services/productService.js';

export const productsRouter = Router();

productsRouter.get('/products/quantities', async (req, res) => {
  const productIds = [].concat(req.query.product_ids || []);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true },
  });

  const variants = products.flatMap((p) =>
    p.variants.map((v) => ({ id: v.id, inventory_quantity: v.inventoryQuantity })),
  );

  res.json({ variants });
});

productsRouter.get('/products', async (req, res) => {
  const { limit, offset, order, category_id: categoryId } = req.query;
  const [products, count] = await Promise.all([
    listPublicProducts({ limit, offset, order, categoryId }),
    countPublicProducts({ categoryId }),
  ]);

  res.json({
    count,
    offset: offset ? Number(offset) : 0,
    limit: limit ? Number(limit) : count,
    products: products.map(normalizeProduct),
  });
});

productsRouter.get('/products/:id', async (req, res) => {
  const product = await getPublicProduct(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product: normalizeProduct(product) });
});

import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { z } from 'zod';
import {
  listAdminProducts,
  getAdminProduct,
  createProduct,
  updateProduct,
  softDeleteProduct,
  addProductImage,
  removeProductImage,
} from '../../services/productService.js';
import { normalizeProduct } from '../../utils/normalize.js';
import { UPLOADS_DIR } from '../../lib/paths.js';

export const adminProductsRouter = Router();

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed'));
    }
    cb(null, true);
  },
});

const variantSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  sku: z.string().optional().nullable(),
  priceInCents: z.number().int().min(0),
  salePriceInCents: z.number().int().min(0).optional().nullable(),
  saleStartsAt: z.string().datetime().optional().nullable(),
  saleEndsAt: z.string().datetime().optional().nullable(),
  manageInventory: z.boolean().optional(),
  inventoryQuantity: z.number().int().min(0).optional(),
});

const productSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  ribbonText: z.string().optional().nullable(),
  description: z.string().optional(),
  thumbnailUrl: z.string().optional().nullable(),
  purchasable: z.boolean().optional(),
  order: z.number().int().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  categoryId: z.string().optional().nullable(),
  variants: z.array(variantSchema).optional(),
});

adminProductsRouter.get('/products', async (req, res) => {
  const { search, status } = req.query;
  const products = await listAdminProducts({ search, status });
  res.json({ products: products.map(normalizeProduct) });
});

adminProductsRouter.get('/products/:id', async (req, res) => {
  const product = await getAdminProduct(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product: normalizeProduct(product) });
});

adminProductsRouter.post('/products', async (req, res, next) => {
  try {
    const data = productSchema.parse(req.body);
    const product = await createProduct(data);
    res.status(201).json({ product: normalizeProduct(product) });
  } catch (err) {
    next(err);
  }
});

adminProductsRouter.patch('/products/:id', async (req, res, next) => {
  try {
    const data = productSchema.partial().parse(req.body);
    const product = await updateProduct(req.params.id, data);
    res.json({ product: normalizeProduct(product) });
  } catch (err) {
    next(err);
  }
});

adminProductsRouter.delete('/products/:id', async (req, res) => {
  await softDeleteProduct(req.params.id);
  res.status(204).end();
});

adminProductsRouter.post('/products/:id/images', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  const url = `/uploads/${req.file.filename}`;
  const image = await addProductImage(req.params.id, url);
  res.status(201).json({ image: { id: image.id, url: image.url, order: image.order } });
});

adminProductsRouter.delete('/products/:id/images/:imageId', async (req, res) => {
  await removeProductImage(req.params.id, req.params.imageId);
  res.status(204).end();
});

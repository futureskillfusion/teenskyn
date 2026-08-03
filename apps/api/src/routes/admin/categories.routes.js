import { Router } from 'express';
import { z } from 'zod';
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  softDeleteCategory,
} from '../../services/categoryService.js';
import { normalizeCategory } from '../../utils/normalize.js';

export const adminCategoriesRouter = Router();

const categorySchema = z.object({
  title: z.string().min(1),
  imageUrl: z.string().optional().nullable(),
  order: z.number().int().optional(),
});

adminCategoriesRouter.get('/categories', async (req, res) => {
  const categories = await listCategories();
  res.json({ categories: categories.map(normalizeCategory) });
});

adminCategoriesRouter.get('/categories/:id', async (req, res) => {
  const category = await getCategory(req.params.id);
  if (!category) return res.status(404).json({ error: 'Category not found' });
  res.json({ category: normalizeCategory(category) });
});

adminCategoriesRouter.post('/categories', async (req, res, next) => {
  try {
    const data = categorySchema.parse(req.body);
    const category = await createCategory(data);
    res.status(201).json({ category: normalizeCategory(category) });
  } catch (err) {
    next(err);
  }
});

adminCategoriesRouter.patch('/categories/:id', async (req, res, next) => {
  try {
    const data = categorySchema.partial().parse(req.body);
    const category = await updateCategory(req.params.id, data);
    res.json({ category: normalizeCategory(category) });
  } catch (err) {
    next(err);
  }
});

adminCategoriesRouter.delete('/categories/:id', async (req, res) => {
  await softDeleteCategory(req.params.id);
  res.status(204).end();
});

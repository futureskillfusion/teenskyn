import { Router } from 'express';
import { listCategories } from '../../services/categoryService.js';
import { normalizeCategory } from '../../utils/normalize.js';

export const categoriesRouter = Router();

categoriesRouter.get('/categories', async (req, res) => {
  const categories = await listCategories();
  res.json({ categories: categories.map(normalizeCategory), count: categories.length });
});

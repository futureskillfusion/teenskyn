import { Router } from 'express';
import { listVariantsWithSales, clearVariantSale } from '../../services/productService.js';
import { getSaleStatus, getSalePercent, currencyInfoFor, formatMoney } from '../../utils/normalize.js';

export const adminSalesRouter = Router();

function serializeSale(variant) {
  const currencyInfo = currencyInfoFor(variant.currency);

  return {
    variant_id: variant.id,
    product_id: variant.productId,
    product_title: variant.product.title,
    product_thumbnail: variant.product.thumbnailUrl,
    variant_title: variant.title,
    price_in_cents: variant.priceInCents,
    price_formatted: formatMoney(variant.priceInCents, currencyInfo),
    sale_price_in_cents: variant.salePriceInCents,
    sale_price_formatted: formatMoney(variant.salePriceInCents, currencyInfo),
    sale_percent: getSalePercent(variant),
    sale_starts_at: variant.saleStartsAt,
    sale_ends_at: variant.saleEndsAt,
    sale_status: getSaleStatus(variant),
  };
}

adminSalesRouter.get('/sales', async (req, res) => {
  const variants = await listVariantsWithSales();
  res.json({ sales: variants.map(serializeSale) });
});

adminSalesRouter.post('/sales/:variantId/end', async (req, res) => {
  await clearVariantSale(req.params.variantId);
  res.status(204).end();
});

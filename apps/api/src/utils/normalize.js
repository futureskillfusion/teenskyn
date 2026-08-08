const CURRENCY_INFO = {
  myr: { code: 'MYR', symbol: 'RM', template: 'RM$1', decimal_digits: 2 },
};

export function currencyInfoFor(currency) {
  return CURRENCY_INFO[(currency || 'myr').toLowerCase()] || CURRENCY_INFO.myr;
}

export function formatMoney(priceInCents, currencyInfo) {
  if (priceInCents === null || priceInCents === undefined) return '';
  const digits = Number.isInteger(currencyInfo?.decimal_digits) ? currencyInfo.decimal_digits : 2;
  const amount = (priceInCents / Math.pow(10, digits)).toFixed(digits);
  return currencyInfo?.template ? currencyInfo.template.replace('$1', amount) : `${currencyInfo?.symbol || ''}${amount}`;
}

// A sale is only "live" (visible to shoppers) inside its start/end window.
// Outside that window the variant silently falls back to its regular price
// — no cron job needed, the sale just closes itself the moment it's read.
export function getSaleStatus(variant, now = new Date()) {
  if (variant.salePriceInCents === null || variant.salePriceInCents === undefined) return 'none';
  if (variant.saleStartsAt && now < new Date(variant.saleStartsAt)) return 'scheduled';
  if (variant.saleEndsAt && now > new Date(variant.saleEndsAt)) return 'expired';
  return 'active';
}

export function getSalePercent(variant) {
  if (variant.salePriceInCents === null || variant.salePriceInCents === undefined || !variant.priceInCents) return null;
  return Math.round((1 - variant.salePriceInCents / variant.priceInCents) * 100);
}

export function normalizeVariant(variant) {
  const currencyInfo = currencyInfoFor(variant.currency);
  const saleStatus = getSaleStatus(variant);
  const effectiveSalePriceInCents = saleStatus === 'active' ? variant.salePriceInCents : null;

  return {
    id: variant.id,
    title: variant.title,
    image_url: variant.imageUrl || null,
    sku: variant.sku || null,
    price_in_cents: variant.priceInCents,
    sale_price_in_cents: effectiveSalePriceInCents,
    currency: variant.currency,
    currency_info: currencyInfo,
    price_formatted: formatMoney(variant.priceInCents, currencyInfo),
    sale_price_formatted: effectiveSalePriceInCents ? formatMoney(effectiveSalePriceInCents, currencyInfo) : null,
    manage_inventory: variant.manageInventory,
    weight: variant.weight ?? null,
    options: [],
    inventory_quantity: variant.inventoryQuantity,
    // Admin-only extras (ignored by the storefront, used by the Sales dashboard/product form).
    // Unlike sale_price_in_cents above, this stays populated even when the sale
    // is scheduled/expired, so the admin edit form can still prefill it.
    sale_price_in_cents_configured: variant.salePriceInCents ?? null,
    sale_status: saleStatus,
    sale_percent: getSalePercent(variant),
    sale_starts_at: variant.saleStartsAt || null,
    sale_ends_at: variant.saleEndsAt || null,
  };
}

function lowestPriceVariant(variants, now = new Date()) {
  return variants.reduce((acc, curr) => {
    const accPrice = getSaleStatus(acc, now) === 'active' ? acc.salePriceInCents : acc.priceInCents;
    const currPrice = getSaleStatus(curr, now) === 'active' ? curr.salePriceInCents : curr.priceInCents;
    return accPrice < currPrice ? acc : curr;
  });
}

export function normalizeProduct(product) {
  const variants = product.variants || [];
  const selectedVariant = variants.length ? lowestPriceVariant(variants) : null;
  const priceInCents = selectedVariant
    ? (getSaleStatus(selectedVariant) === 'active' ? selectedVariant.salePriceInCents : selectedVariant.priceInCents)
    : 0;
  const currency = selectedVariant?.currency || 'myr';

  return {
    id: product.id,
    title: product.title,
    subtitle: product.subtitle,
    ribbon_text: product.ribbonText,
    description: product.description,
    image: product.thumbnailUrl || product.images?.[0]?.url || null,
    price_in_cents: priceInCents,
    currency,
    purchasable: product.purchasable,
    order: product.order,
    site_product_selection: 'lowest_price_first',
    images: (product.images || [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((img) => ({ url: img.url, order: img.order, type: img.type })),
    options: [],
    variants: variants.map(normalizeVariant),
    collections: product.categoryId
      ? [{ product_id: product.id, collection_id: product.categoryId, order: 0 }]
      : [],
    additional_info: [],
    type: { value: '' },
    custom_fields: [],
    related_products: [],
    updated_at: product.updatedAt,
    status: product.status,
    created_at: product.createdAt,
    deleted_at: product.deletedAt,
    metadata: {},
  };
}

export function normalizeCategory(category) {
  return {
    id: category.id,
    title: category.title,
    image_url: category.imageUrl,
    store_id: 'teenskyn',
    created_at: category.createdAt,
    updated_at: category.updatedAt,
    deleted_at: category.deletedAt,
    metadata: null,
  };
}

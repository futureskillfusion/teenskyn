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

export function normalizeVariant(variant) {
  const currencyInfo = currencyInfoFor(variant.currency);

  return {
    id: variant.id,
    title: variant.title,
    image_url: variant.imageUrl || null,
    sku: variant.sku || null,
    price_in_cents: variant.priceInCents,
    sale_price_in_cents: variant.salePriceInCents ?? null,
    currency: variant.currency,
    currency_info: currencyInfo,
    price_formatted: formatMoney(variant.priceInCents, currencyInfo),
    sale_price_formatted: variant.salePriceInCents ? formatMoney(variant.salePriceInCents, currencyInfo) : null,
    manage_inventory: variant.manageInventory,
    weight: variant.weight ?? null,
    options: [],
    inventory_quantity: variant.inventoryQuantity,
  };
}

function lowestPriceVariant(variants) {
  return variants.reduce((acc, curr) => {
    const accPrice = acc.salePriceInCents ?? acc.priceInCents;
    const currPrice = curr.salePriceInCents ?? curr.priceInCents;
    return accPrice < currPrice ? acc : curr;
  });
}

export function normalizeProduct(product) {
  const variants = product.variants || [];
  const selectedVariant = variants.length ? lowestPriceVariant(variants) : null;
  const priceInCents = selectedVariant ? (selectedVariant.salePriceInCents ?? selectedVariant.priceInCents) : 0;
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

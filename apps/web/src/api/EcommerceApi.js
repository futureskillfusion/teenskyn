const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const formatCurrency = (priceInCents, currencyInfo) => {
  if (!currencyInfo || priceInCents === null || priceInCents === undefined) {
    return "";
  }

  const { code, symbol, template, decimal_digits } = currencyInfo;
  const currencyDisplay = symbol || code || "RM";
  const digits = Number.isInteger(decimal_digits) ? decimal_digits : 2;
  const amount = (priceInCents / Math.pow(10, digits)).toFixed(digits);

  if (template) {
    return template.replace("$1", amount);
  }

  return `${currencyDisplay}${amount}`;
};

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * List products from the store catalog.
 * @param {Object} [params]
 * @param {string[]} [params.ids]
 * @param {string|number} [params.offset]
 * @param {string|number} [params.limit]
 * @param {string} [params.order]
 * @param {string} [params.category_id]
 * @returns {Promise<{count:number, offset:number, limit:number, products:Array}>}
 */
export async function getProducts({ offset, limit, order, category_id } = {}) {
  const queryParams = new URLSearchParams();
  if (offset) queryParams.append("offset", String(offset));
  if (limit) queryParams.append("limit", String(limit));
  if (order) queryParams.append("order", String(order).toUpperCase());
  if (category_id) queryParams.append("category_id", String(category_id));

  const queryString = queryParams.toString();
  return request(`/products${queryString ? `?${queryString}` : ""}`);
}

/**
 * Retrieve a single product by id.
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function getProduct(id) {
  const data = await request(`/products/${id}`);
  return data.product;
}

/**
 * Retrieve up-to-date inventory quantities for a set of products.
 * @param {Object} params
 * @param {string[]} params.product_ids
 * @returns {Promise<{variants: Array<{id:string, inventory_quantity:number}>}>}
 */
export async function getProductQuantities({ product_ids }) {
  const queryParams = new URLSearchParams();
  (product_ids || []).forEach((id) => queryParams.append("product_ids", id));
  return request(`/products/quantities?${queryParams.toString()}`);
}

/**
 * Retrieve all product categories.
 * @returns {Promise<{categories: Array, count: number}>}
 */
export async function getCategories() {
  return request("/categories");
}

/**
 * Create a Stripe Checkout session for the given cart items.
 * @param {Object} params
 * @param {Array<{variant_id:string, quantity:number}>} params.items
 * @param {string} params.successUrl
 * @param {string} params.cancelUrl
 * @returns {Promise<{url:string}>}
 */
export async function initializeCheckout({ items, successUrl, cancelUrl }) {
  return request("/checkout", {
    method: "POST",
    body: JSON.stringify({ items, successUrl, cancelUrl }),
  });
}

/**
 * Place a Cash on Delivery order (no payment gateway involved).
 * @param {Object} params
 * @param {Array<{variant_id:string, quantity:number}>} params.items
 * @param {{name:string, email:string, phone:string, address:string}} params.customer
 * @returns {Promise<{orderNumber:string, orderId:string}>}
 */
export async function createCodOrder({ items, customer }) {
  return request("/checkout/cod", {
    method: "POST",
    body: JSON.stringify({ items, customer }),
  });
}

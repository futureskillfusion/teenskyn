import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart as CartIcon, Search, Loader2 } from 'lucide-react';
import { getProducts, getProductQuantities, getCategories } from '@/api/EcommerceApi';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';
import ShoppingCartDrawer from '@/components/ShoppingCart';
import { Toaster } from '@/components/ui/toaster';

const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAxYTRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI0ZGRDcwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPnRlZW4gc2t5bjwvdGV4dD48L3N2Zz4K";

function ProductCard({ product, index }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const displayVariant = product.variants[0];
  const hasSale = displayVariant && displayVariant.sale_price_in_cents !== null;
  const displayPrice = hasSale ? displayVariant.sale_price_formatted : displayVariant?.price_formatted;
  const originalPrice = hasSale ? displayVariant?.price_formatted : null;

  const handleAddToCart = useCallback(async (e) => {
    e.preventDefault();
    if (product.variants.length > 1) return;
    try {
      await addToCart(product, displayVariant, 1, displayVariant.inventory_quantity);
      trackEvent('add_to_cart', { productId: product.id, metadata: { quantity: 1 } });
      toast({ title: 'Added to cart!', description: `${product.title} added.` });
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  }, [product, displayVariant, addToCart, toast]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: (index % 8) * 0.05 }}>
      <Link to={`/product/${product.id}`} className="block group">
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-[#FFD700]">
          <div className="relative overflow-hidden bg-[#f8f6ff]" style={{ height: '220px' }}>
            <img src={product.image || placeholderImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            {product.ribbon_text && (
              <div className="absolute top-3 left-3 bg-[#FFD700] text-[#001a4d] text-xs font-extrabold px-3 py-1 rounded-full font-display shadow">{product.ribbon_text}</div>
            )}
            <div className="absolute top-3 right-3 bg-[#001a4d] text-[#FFD700] text-sm font-extrabold px-3 py-1 rounded-full shadow">
              {hasSale && <span className="line-through opacity-60 mr-1 text-xs">{originalPrice}</span>}
              {displayPrice}
            </div>
            {hasSale && displayVariant?.sale_percent > 0 && (
              <div className="absolute bottom-3 left-3 bg-red-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow">-{displayVariant.sale_percent}%</div>
            )}
          </div>
          <div className="p-5">
            <h3 className="font-display text-lg font-bold text-[#001a4d] mb-1 leading-tight">{product.title}</h3>
            <p className="text-sm text-[#001a4d]/60 mb-4 line-clamp-2">{product.subtitle || 'Made for teen skin.'}</p>
            <button
              onClick={handleAddToCart}
              className="w-full bg-[#001a4d] hover:bg-[#FFD700] text-white hover:text-[#001a4d] font-bold py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm active:scale-95"
            >
              <CartIcon size={16} />
              {product.variants.length > 1 ? 'Choose options' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('__all__');
  const [cartOpen, setCartOpen] = useState(false);
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [productsResp, categoriesResp] = await Promise.all([getProducts(), getCategories()]);
        setCategories(categoriesResp.categories || []);
        if (!productsResp.products.length) { setProducts([]); return; }
        const ids = productsResp.products.map((p) => p.id);
        const qty = await getProductQuantities({ product_ids: ids });
        const qtyMap = new Map(qty.variants.map((v) => [v.id, v.inventory_quantity]));
        setProducts(productsResp.products.map((p) => ({
          ...p,
          variants: p.variants.map((v) => ({ ...v, inventory_quantity: qtyMap.get(v.id) ?? v.inventory_quantity })),
        })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.subtitle?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryId === '__all__' || p.collections?.some((c) => c.collection_id === categoryId);
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryId]);

  return (
    <div className="min-h-screen bg-[#f8f6ff]">
      <Helmet>
        <title>Shop All Products | Teen Skyn</title>
        <meta name="description" content="Browse the full Teen Skyn skincare range — search, filter and shop gentle products made for teen skin." />
      </Helmet>

      <header className="sticky top-0 z-40 border-b-4 border-[#FFD700] bg-[#001a4d]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4 px-5 py-3">
          <Link to="/" className="flex items-center gap-2 text-white hover:text-[#FFD700] transition-colors">
            <ArrowLeft size={18} />
            <span className="font-display font-bold text-sm">Back to Teen Skyn</span>
          </Link>
          <button onClick={() => setCartOpen(true)} className="relative text-white hover:text-[#FFD700] transition-colors" aria-label="Open cart">
            <CartIcon size={22} />
            {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-[#FFD700] text-[#001a4d] text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>}
          </button>
        </div>
      </header>

      <ShoppingCartDrawer isCartOpen={cartOpen} setIsCartOpen={setCartOpen} />
      <Toaster />

      {/* HERO */}
      <div className="relative overflow-hidden bg-[#3a1078] ts-doodle">
        <div className="mx-auto max-w-[86rem] px-5 py-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#FFD700] px-4 py-1.5 font-display text-sm uppercase tracking-wide text-[#001a4d]">
            Full range
          </span>
          <h1 className="mt-5 font-display text-[clamp(2.6rem,7vw,5rem)] font-extrabold leading-[0.95] text-[#FFD700] ts-sticker">
            Shop everything
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-lg text-white/85">
            Every Teen Skyn product in one place. Search, filter, and find your routine.
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="mx-auto max-w-[86rem] px-5 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#001a4d]/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-2xl border-2 border-[#001a4d]/15 bg-white pl-11 pr-4 py-3 text-[#001a4d] placeholder:text-[#001a4d]/40 outline-none focus:border-[#FFD700] transition-colors"
            />
          </div>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-2xl border-2 border-[#001a4d]/15 bg-white px-4 py-3 text-[#001a4d] outline-none focus:border-[#FFD700] transition-colors sm:w-56"
          >
            <option value="__all__">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 text-[#001a4d] animate-spin" />
          </div>
        ) : error ? (
          <p className="text-center text-red-500 py-10">Error: {error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-[#001a4d]/50 py-10">No products match your search.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

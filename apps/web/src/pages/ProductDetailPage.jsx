import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProduct, getProductQuantities } from '@/api/EcommerceApi';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';
import { ShoppingCart, Loader2, ArrowLeft, Minus, Plus, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import ShoppingCartDrawer from '@/components/ShoppingCart';
import { Toaster } from '@/components/ui/toaster';

const placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAxYTRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI0ZGRDcwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPnRlZW4gc2t5bjwvdGV4dD48L3N2Zz4K";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const { addToCart, cartItems } = useCart();
  const { toast } = useToast();
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const p = await getProduct(id);
        const qty = await getProductQuantities({ fields: 'inventory_quantity', product_ids: [p.id] });
        const qMap = new Map(qty.variants.map(v => [v.id, v.inventory_quantity]));
        const enriched = { ...p, variants: p.variants.map(v => ({ ...v, inventory_quantity: qMap.get(v.id) ?? v.inventory_quantity })) };
        setProduct(enriched);
        setSelectedVariant(enriched.variants[0] || null);
        trackEvent('product_view', { productId: enriched.id });
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleAdd = useCallback(async () => {
    if (!product || !selectedVariant) return;
    try {
      await addToCart(product, selectedVariant, quantity, selectedVariant.inventory_quantity);
      trackEvent('add_to_cart', { productId: product.id, metadata: { quantity } });
      toast({ title: 'Added to cart!', description: `${product.title} x${quantity}` });
      setCartOpen(true);
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  }, [product, selectedVariant, quantity, addToCart, toast]);

  const imgs = product?.images || [];
  const canBuy = product?.purchasable && (!selectedVariant?.manage_inventory || quantity <= (selectedVariant?.inventory_quantity || 0));

  return (
    <div className="min-h-screen bg-[#f8f6ff]">
      <Helmet>
        <title>{product ? `${product.title} — Teen Skyn` : 'Product — Teen Skyn'}</title>
        <meta name="description" content={product?.subtitle || 'Teen Skyn skincare'} />
      </Helmet>

      {/* Nav */}
      <nav className="bg-[#001a4d] px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2 text-white hover:text-[#FFD700] transition-colors">
          <ArrowLeft size={18} />
          <span className="font-display font-bold text-sm">Back to Store</span>
        </Link>
        <button onClick={() => setCartOpen(true)} className="relative text-white hover:text-[#FFD700] transition-colors">
          <ShoppingCart size={22} />
          {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-[#FFD700] text-[#001a4d] text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>}
        </button>
      </nav>

      <ShoppingCartDrawer isCartOpen={cartOpen} setIsCartOpen={setCartOpen} />
      <Toaster />

      <div className="max-w-5xl mx-auto px-4 py-10">
        {loading && <div className="flex justify-center py-20"><Loader2 size={40} className="text-[#001a4d] animate-spin" /></div>}
        {error && <div className="text-center py-20"><XCircle size={48} className="text-red-400 mx-auto mb-4" /><p className="text-red-500">{error}</p></div>}

        {product && (
          <div className="grid md:grid-cols-2 gap-10 bg-white rounded-3xl p-6 md:p-10 shadow-xl">
            {/* Images */}
            <div>
              <div className="relative rounded-2xl overflow-hidden bg-[#f8f6ff]" style={{aspectRatio:'1'}}>
                <img src={imgs[imgIdx]?.url || product.image || placeholder} alt={product.title} className="w-full h-full object-cover" />
                {imgs.length > 1 && <>
                  <button onClick={() => setImgIdx(p => p === 0 ? imgs.length-1 : p-1)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow"><ChevronLeft size={18} className="text-[#001a4d]" /></button>
                  <button onClick={() => setImgIdx(p => p === imgs.length-1 ? 0 : p+1)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow"><ChevronRight size={18} className="text-[#001a4d]" /></button>
                </>}
                {product.ribbon_text && <span className="absolute top-4 left-4 bg-[#FFD700] text-[#001a4d] text-xs font-extrabold px-3 py-1 rounded-full">{product.ribbon_text}</span>}
              </div>
              {imgs.length > 1 && (
                <div className="flex gap-2 mt-3">
                  {imgs.map((img, i) => (
                    <button key={i} onClick={() => setImgIdx(i)} className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-[#FFD700]' : 'border-transparent'}`}>
                      <img src={img.url || placeholder} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-[#001a4d] mb-1">{product.title}</h1>
              {product.subtitle && <p className="text-[#001a4d]/60 mb-4">{product.subtitle}</p>}

              <div className="flex items-baseline gap-3 mb-5">
                <span className="font-display text-3xl font-extrabold text-[#001a4d]">
                  {selectedVariant?.sale_price_formatted || selectedVariant?.price_formatted}
                </span>
                {selectedVariant?.sale_price_in_cents && (
                  <span className="text-lg text-[#001a4d]/40 line-through">{selectedVariant.price_formatted}</span>
                )}
                {selectedVariant?.sale_price_in_cents && selectedVariant?.sale_percent > 0 && (
                  <span className="bg-red-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full">-{selectedVariant.sale_percent}%</span>
                )}
              </div>

              {product.description && (
                <div className="prose prose-sm text-[#001a4d]/70 mb-5" dangerouslySetInnerHTML={{ __html: product.description }} />
              )}

              {product.variants.length > 1 && (
                <div className="mb-5">
                  <p className="text-sm font-semibold text-[#001a4d] mb-2">Variant</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map(v => (
                      <button key={v.id} onClick={() => setSelectedVariant(v)} className={`px-4 py-1.5 rounded-lg border-2 text-sm font-bold transition-all ${selectedVariant?.id === v.id ? 'bg-[#001a4d] border-[#001a4d] text-white' : 'border-[#001a4d]/20 text-[#001a4d] hover:border-[#001a4d]'}`}>{v.title}</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <p className="text-sm font-semibold text-[#001a4d]">Qty</p>
                <div className="flex items-center border-2 border-[#001a4d]/20 rounded-xl overflow-hidden">
                  <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-9 h-9 flex items-center justify-center hover:bg-[#001a4d]/5 text-[#001a4d]"><Minus size={14} /></button>
                  <span className="w-10 text-center font-extrabold text-[#001a4d]">{quantity}</span>
                  <button onClick={() => setQuantity(q => q+1)} className="w-9 h-9 flex items-center justify-center hover:bg-[#001a4d]/5 text-[#001a4d]"><Plus size={14} /></button>
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={!canBuy}
                className="w-full bg-[#001a4d] hover:bg-[#FFD700] text-white hover:text-[#001a4d] font-extrabold py-4 rounded-2xl text-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>

              {product.additional_info?.length > 0 && (
                <div className="mt-6 space-y-4 border-t border-[#001a4d]/10 pt-5">
                  {product.additional_info.sort((a,b) => a.order - b.order).map(info => (
                    <div key={info.id}>
                      <h3 className="font-bold text-[#001a4d] mb-1">{info.title}</h3>
                      <div className="prose prose-sm text-[#001a4d]/60" dangerouslySetInnerHTML={{ __html: info.description }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

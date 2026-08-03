import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Loader2, Star } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { getProducts, getProductQuantities } from '@/api/EcommerceApi';
import { trackEvent } from '@/lib/analytics';

const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAxYTRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI0ZGRDcwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPnRlZW4gc2t5bjwvdGV4dD48L3N2Zz4K";

const ProductCard = ({ product, index }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const displayVariant = useMemo(() => product.variants[0], [product]);
  const hasSale = useMemo(() => displayVariant && displayVariant.sale_price_in_cents !== null, [displayVariant]);
  const displayPrice = useMemo(() => hasSale ? displayVariant.sale_price_formatted : displayVariant?.price_formatted, [displayVariant, hasSale]);
  const originalPrice = useMemo(() => hasSale ? displayVariant?.price_formatted : null, [displayVariant, hasSale]);

  const handleAddToCart = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.variants.length > 1) { navigate(`/product/${product.id}`); return; }
    const defaultVariant = product.variants[0];
    try {
      await addToCart(product, defaultVariant, 1, defaultVariant.inventory_quantity);
      trackEvent('add_to_cart', { productId: product.id, metadata: { quantity: 1 } });
      toast({ title: "Added to cart!", description: `${product.title} added.` });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [product, addToCart, toast, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-[#FFD700]">
          <div className="relative overflow-hidden bg-[#f8f6ff]" style={{height: '220px'}}>
            <img
              src={product.image || placeholderImage}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {product.ribbon_text && (
              <div className="absolute top-3 left-3 bg-[#FFD700] text-[#001a4d] text-xs font-extrabold px-3 py-1 rounded-full font-display shadow">
                {product.ribbon_text}
              </div>
            )}
            <div className="absolute top-3 right-3 bg-[#001a4d] text-[#FFD700] text-sm font-extrabold px-3 py-1 rounded-full shadow">
              {hasSale && <span className="line-through opacity-60 mr-1 text-xs">{originalPrice}</span>}
              {displayPrice}
            </div>
          </div>
          <div className="p-5">
            <h3 className="font-display text-lg font-bold text-[#001a4d] mb-1 leading-tight">{product.title}</h3>
            <p className="text-sm text-[#001a4d]/60 mb-4 line-clamp-2">{product.subtitle || 'Made for teen skin.'}</p>
            <button
              onClick={handleAddToCart}
              className="w-full bg-[#001a4d] hover:bg-[#FFD700] text-white hover:text-[#001a4d] font-bold py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm active:scale-95"
            >
              <ShoppingCart size={16} />
              Add to Cart
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const resp = await getProducts();
        if (!resp.products.length) { setProducts([]); return; }
        const ids = resp.products.map(p => p.id);
        const qty = await getProductQuantities({ fields: 'inventory_quantity', product_ids: ids });
        const qtyMap = new Map(qty.variants.map(v => [v.id, v.inventory_quantity]));
        setProducts(resp.products.map(p => ({
          ...p,
          variants: p.variants.map(v => ({ ...v, inventory_quantity: qtyMap.get(v.id) ?? v.inventory_quantity }))
        })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="h-10 w-10 text-[#001a4d] animate-spin" />
    </div>
  );

  if (error) return <p className="text-center text-red-500 py-10">Error: {error}</p>;
  if (!products.length) return <p className="text-center text-[#001a4d]/50 py-10">No products available.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
};

export default ProductsList;

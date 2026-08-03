import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart as ShoppingCartIcon, X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { initializeCheckout } from '@/api/EcommerceApi';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';

const ShoppingCart = ({ isCartOpen, setIsCartOpen }) => {
  const { toast } = useToast();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  const handleCheckout = useCallback(async () => {
    if (!cartItems.length) return;
    try {
      const items = cartItems.map(item => ({ variant_id: item.variant.id, quantity: item.quantity }));
      trackEvent('checkout_started', { metadata: { itemCount: items.length } });
      const { url } = await initializeCheckout({
        items,
        successUrl: `${window.location.origin}/`,
        cancelUrl: window.location.href,
      });
      clearCart();
      window.location.href = url;
    } catch {
      toast({ title: 'Checkout error', description: 'Please try again.', variant: 'destructive' });
    }
  }, [cartItems, clearCart, toast]);

  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex justify-end"
          onClick={() => setIsCartOpen(false)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="h-full w-full max-w-md bg-white flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#001a4d]">
              <div className="flex items-center gap-2">
                <ShoppingCartIcon size={20} className="text-[#FFD700]" />
                <h2 className="font-display text-xl font-bold text-white">Your Cart</h2>
                {itemCount > 0 && (
                  <span className="bg-[#FFD700] text-[#001a4d] text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center">{itemCount}</span>
                )}
              </div>
              <button onClick={() => setIsCartOpen(false)} className="text-white hover:text-[#FFD700] transition-colors p-1">
                <X size={22} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <ShoppingCartIcon size={56} className="text-[#001a4d]/20 mb-4" />
                  <p className="font-display text-xl font-bold text-[#001a4d] mb-2">Your cart is empty</p>
                  <p className="text-sm text-[#001a4d]/50">Add some products to get started!</p>
                  <button onClick={() => setIsCartOpen(false)} className="mt-6 bg-[#FFD700] text-[#001a4d] font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#e5c200] transition-colors">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cartItems.map(item => {
                  const price = item.variant.sale_price_in_cents ?? item.variant.price_in_cents;
                  const priceFormatted = item.variant.sale_price_formatted ?? item.variant.price_formatted;
                  return (
                    <div key={item.variant.id} className="flex gap-3 bg-[#f8f6ff] rounded-xl p-3 border border-[#001a4d]/10">
                      <img src={item.product.image || ''} alt={item.product.title} className="w-18 h-18 w-[72px] h-[72px] object-cover rounded-lg flex-shrink-0 bg-white" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#001a4d] text-sm leading-tight">{item.product.title}</p>
                        <p className="text-xs text-[#001a4d]/50 mb-2">{item.variant.title !== 'Default Variant' ? item.variant.title : ''}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 border border-[#001a4d]/20 rounded-lg overflow-hidden">
                            <button onClick={() => item.quantity > 1 ? updateQuantity(item.variant.id, item.quantity - 1) : removeFromCart(item.variant.id)} className="w-7 h-7 flex items-center justify-center hover:bg-[#001a4d]/10 text-[#001a4d]"><Minus size={12} /></button>
                            <span className="w-7 text-center text-sm font-bold text-[#001a4d]">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.variant.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-[#001a4d]/10 text-[#001a4d]"><Plus size={12} /></button>
                          </div>
                          <span className="font-extrabold text-[#001a4d] text-sm">{priceFormatted}</span>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.variant.id)} className="text-red-400 hover:text-red-600 self-start mt-1 flex-shrink-0"><Trash2 size={15} /></button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="px-6 py-5 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-[#001a4d]">Total</span>
                  <span className="font-display text-2xl font-extrabold text-[#001a4d]">{getCartTotal()}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-[#001a4d] hover:bg-[#FFD700] text-white hover:text-[#001a4d] font-extrabold py-3.5 rounded-xl transition-all duration-200 text-base active:scale-95"
                >
                  Checkout Now
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShoppingCart;

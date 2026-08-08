import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, ArrowLeft, Plus, Trash2, Upload, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { adminApi } from '@/admin/lib/adminApi';

const centsToRinggit = (cents) => (cents === null || cents === undefined ? '' : (cents / 100).toFixed(2));
const ringgitToCents = (value) => Math.round(parseFloat(value || '0') * 100);

const SALE_STATUS_LABEL = { active: 'Sale active', scheduled: 'Sale scheduled', expired: 'Sale ended' };
const SALE_STATUS_VARIANT = { active: 'default', scheduled: 'secondary', expired: 'outline' };

const daysUntil = (isoDate) => {
  if (!isoDate) return 7;
  const diffMs = new Date(isoDate).getTime() - Date.now();
  return Math.max(1, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
};

const emptyVariant = () => ({
  title: 'Default Variant',
  sku: '',
  price: '',
  manageInventory: true,
  inventoryQuantity: 0,
  saleEnabled: false,
  salePercent: '20',
  saleDurationDays: '7',
  saleStatus: 'none',
  saleEndsAt: null,
});

export default function ProductFormPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [categoryId, setCategoryId] = useState('');
  const [purchasable, setPurchasable] = useState(true);
  const [variants, setVariants] = useState([emptyVariant()]);

  useEffect(() => {
    adminApi.get('/categories').then((data) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    if (isNew) return;
    adminApi.get(`/products/${id}`).then(({ product }) => {
      setTitle(product.title);
      setSubtitle(product.subtitle || '');
      setDescription(product.description || '');
      setStatus(product.status || 'active');
      setCategoryId(product.collections?.[0]?.collection_id || '');
      setPurchasable(product.purchasable);
      setImages(product.images || []);
      setVariants(product.variants.map((v) => ({
        id: v.id,
        title: v.title,
        sku: v.sku || '',
        price: centsToRinggit(v.price_in_cents),
        manageInventory: v.manage_inventory,
        inventoryQuantity: v.inventory_quantity,
        saleEnabled: Boolean(v.sale_price_in_cents_configured) && v.sale_status !== 'expired',
        salePercent: v.sale_percent !== null ? String(v.sale_percent) : '20',
        saleDurationDays: String(daysUntil(v.sale_ends_at)),
        saleStatus: v.sale_status || 'none',
        saleEndsAt: v.sale_ends_at,
      })));
      setLoading(false);
    });
  }, [id, isNew]);

  const updateVariant = (index, patch) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  const addVariant = () => setVariants((prev) => [...prev, emptyVariant()]);
  const removeVariant = (index) => setVariants((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      title,
      subtitle: subtitle || null,
      description,
      status,
      categoryId: categoryId || null,
      purchasable,
      variants: variants.map((v) => {
        const priceInCents = ringgitToCents(v.price);
        const percent = Math.min(99, Math.max(0, Number(v.salePercent) || 0));
        const durationDays = Math.max(1, Number(v.saleDurationDays) || 1);
        const saleActive = v.saleEnabled && percent > 0;

        return {
          ...(v.id ? { id: v.id } : {}),
          title: v.title || 'Default Variant',
          sku: v.sku || null,
          priceInCents,
          salePriceInCents: saleActive ? Math.round(priceInCents * (1 - percent / 100)) : null,
          saleStartsAt: saleActive ? new Date().toISOString() : null,
          saleEndsAt: saleActive ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString() : null,
          manageInventory: v.manageInventory,
          inventoryQuantity: Number(v.inventoryQuantity) || 0,
        };
      }),
    };

    try {
      if (isNew) {
        const { product } = await adminApi.post('/products', payload);
        navigate(`/admin/products/${product.id}`, { replace: true });
      } else {
        await adminApi.patch(`/products/${id}`, payload);
        navigate('/admin/products');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file || isNew) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { image } = await adminApi.post(`/products/${id}/images`, formData);
      setImages((prev) => [...prev, image]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, [id, isNew]);

  const handleImageDelete = async (imageId) => {
    await adminApi.delete(`/products/${id}/images/${imageId}`);
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#001a4d]" /></div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" className="gap-2 px-0 text-[#001a4d]" onClick={() => navigate('/admin/products')}>
        <ArrowLeft size={16} /> Back to products
      </Button>

      <h1 className="font-display text-2xl font-extrabold text-[#001a4d]">{isNew ? 'New product' : 'Edit product'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#001a4d]">Title</label>
              <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#001a4d]">Subtitle</label>
              <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="e.g. 40 ml · Cleanse • Refresh" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#001a4d]">Description</label>
              <Textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#001a4d]">Category</label>
                <Select value={categoryId || '__none__'} onValueChange={(v) => setCategoryId(v === '__none__' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="No category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No category</SelectItem>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#001a4d]">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={purchasable} onCheckedChange={setPurchasable} />
              <label className="text-sm font-semibold text-[#001a4d]">Purchasable</label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Variants &amp; pricing</CardTitle>
            <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addVariant}><Plus size={14} /> Add variant</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {variants.map((v, index) => {
              const price = parseFloat(v.price) || 0;
              const percent = Math.min(99, Math.max(0, Number(v.salePercent) || 0));
              const salePrice = v.saleEnabled && percent > 0 ? (price * (1 - percent / 100)).toFixed(2) : null;

              return (
              <div key={v.id || index} className="space-y-4 rounded-lg border p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="lg:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Variant title</label>
                    <Input value={v.title} onChange={(e) => updateVariant(index, { title: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">SKU</label>
                    <Input value={v.sku} onChange={(e) => updateVariant(index, { sku: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Price (RM)</label>
                    <Input type="number" step="0.01" min="0" required value={v.price} onChange={(e) => updateVariant(index, { price: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Stock</label>
                    <Input type="number" min="0" value={v.inventoryQuantity} onChange={(e) => updateVariant(index, { inventoryQuantity: e.target.value })} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Switch checked={v.manageInventory} onCheckedChange={(checked) => updateVariant(index, { manageInventory: checked })} />
                    <label className="text-xs font-semibold text-muted-foreground">Track inventory</label>
                  </div>
                  {variants.length > 1 && (
                    <Button type="button" variant="outline" size="sm" className="gap-1 text-red-500" onClick={() => removeVariant(index)}>
                      <Trash2 size={14} /> Remove variant
                    </Button>
                  )}
                </div>

                <div className="rounded-lg bg-[#f8f6ff] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-[#3a1078]" />
                      <span className="text-sm font-semibold text-[#001a4d]">Sale / Offer</span>
                      {v.saleStatus && v.saleStatus !== 'none' && (
                        <Badge variant={SALE_STATUS_VARIANT[v.saleStatus]}>{SALE_STATUS_LABEL[v.saleStatus]}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={v.saleEnabled} onCheckedChange={(checked) => updateVariant(index, { saleEnabled: checked })} />
                      <label className="text-xs font-semibold text-muted-foreground">Run a sale</label>
                    </div>
                  </div>

                  {v.saleEnabled && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Discount %</label>
                        <Input type="number" min="1" max="99" value={v.salePercent} onChange={(e) => updateVariant(index, { salePercent: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Runs for (days)</label>
                        <Input type="number" min="1" value={v.saleDurationDays} onChange={(e) => updateVariant(index, { saleDurationDays: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Sale price</label>
                        <div className="flex h-9 items-center rounded-md border border-input bg-white px-3 text-sm font-bold text-[#001a4d]">
                          {salePrice ? `RM${salePrice}` : '—'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </CardContent>
        </Card>

        {!isNew && (
          <Card>
            <CardHeader><CardTitle className="text-base">Images</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {images.map((img) => (
                  <div key={img.id} className="group relative h-24 w-24 overflow-hidden rounded-lg border">
                    <img src={img.url.startsWith('http') ? img.url : `${(import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace('/api', '')}${img.url}`} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => handleImageDelete(img.id)} className="absolute inset-0 hidden items-center justify-center bg-black/50 text-white group-hover:flex">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-muted-foreground hover:border-[#001a4d]">
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                  <span className="text-xs">Upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
            </CardContent>
          </Card>
        )}

        {error && <p className="text-sm font-medium text-red-500">{error}</p>}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>Cancel</Button>
          <Button type="submit" disabled={saving} className="bg-[#001a4d] hover:bg-[#FFD700] hover:text-[#001a4d]">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isNew ? 'Create product' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}

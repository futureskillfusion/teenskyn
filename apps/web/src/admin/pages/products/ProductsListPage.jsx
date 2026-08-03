import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApi } from '@/admin/lib/adminApi';

const STATUS_VARIANT = { active: 'default', draft: 'secondary', archived: 'outline' };

export default function ProductsListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await adminApi.get(`/products${search ? `?search=${encodeURIComponent(search)}` : ''}`);
    setProducts(data.products);
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    await adminApi.delete(`/products/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#001a4d]">Products</h1>
          <p className="text-muted-foreground">Manage your catalog.</p>
        </div>
        <Button asChild className="bg-[#001a4d] hover:bg-[#FFD700] hover:text-[#001a4d]">
          <Link to="/admin/products/new"><Plus size={16} /> New product</Link>
        </Button>
      </div>

      <Input placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#001a4d]" /></div>
      ) : products.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">No products found.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const totalStock = product.variants.reduce((sum, v) => sum + (v.manage_inventory ? v.inventory_quantity : 0), 0);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={product.image || ''} alt="" className="h-10 w-10 rounded-lg bg-[#f8f6ff] object-cover" />
                        <div>
                          <p className="font-semibold text-[#001a4d]">{product.title}</p>
                          <p className="text-xs text-muted-foreground">{product.subtitle}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={STATUS_VARIANT[product.status] || 'secondary'} className="capitalize">{product.status}</Badge></TableCell>
                    <TableCell>{product.variants[0]?.price_formatted}</TableCell>
                    <TableCell>{totalStock}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="icon">
                          <Link to={`/admin/products/${product.id}`}><Pencil size={14} /></Link>
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDelete(product.id)}>
                          <Trash2 size={14} className="text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

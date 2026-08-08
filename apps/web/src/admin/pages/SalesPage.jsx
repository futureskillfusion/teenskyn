import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Tag, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApi } from '@/admin/lib/adminApi';

const STATUS_LABEL = { active: 'Active', scheduled: 'Scheduled', expired: 'Ended' };
const STATUS_VARIANT = { active: 'default', scheduled: 'secondary', expired: 'outline' };

function daysLeft(isoDate) {
  if (!isoDate) return null;
  const diffMs = new Date(isoDate).getTime() - Date.now();
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('__all__');

  const load = () => {
    setLoading(true);
    adminApi.get('/sales').then((data) => setSales(data.sales)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleEndSale = async (variantId) => {
    if (!window.confirm('End this sale now? The product will go back to its regular price immediately.')) return;
    await adminApi.post(`/sales/${variantId}/end`, {});
    load();
  };

  const filtered = statusFilter === '__all__' ? sales : sales.filter((s) => s.sale_status === statusFilter);
  const activeCount = sales.filter((s) => s.sale_status === 'active').length;
  const scheduledCount = sales.filter((s) => s.sale_status === 'scheduled').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-[#001a4d]">Sales &amp; Offers</h1>
        <p className="text-muted-foreground">Discounts run automatically for their set duration, then the price reverts on its own — no action needed.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active sales</CardTitle></CardHeader>
          <CardContent><p className="font-display text-2xl font-extrabold text-[#001a4d]">{activeCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Scheduled</CardTitle></CardHeader>
          <CardContent><p className="font-display text-2xl font-extrabold text-[#001a4d]">{scheduledCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total configured</CardTitle></CardHeader>
          <CardContent><p className="font-display text-2xl font-extrabold text-[#001a4d]">{sales.length}</p></CardContent>
        </Card>
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All sales</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="scheduled">Scheduled</SelectItem>
          <SelectItem value="expired">Ended</SelectItem>
        </SelectContent>
      </Select>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#001a4d]" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-white py-16 text-center text-muted-foreground">
          <Tag className="mx-auto mb-3 h-8 w-8 opacity-40" />
          No sales set up yet. Open a product and toggle "Run a sale" to create one.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Regular price</TableHead>
                <TableHead className="text-right">Sale price</TableHead>
                <TableHead className="text-right">Off</TableHead>
                <TableHead>Ends</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sale) => {
                const remaining = daysLeft(sale.sale_ends_at);
                return (
                  <TableRow key={sale.variant_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={sale.product_thumbnail || ''} alt="" className="h-10 w-10 rounded-lg bg-[#f8f6ff] object-cover" />
                        <div>
                          <Link to={`/admin/products/${sale.product_id}`} className="font-semibold text-[#001a4d] hover:underline">{sale.product_title}</Link>
                          {sale.variant_title !== 'Default Variant' && <p className="text-xs text-muted-foreground">{sale.variant_title}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={STATUS_VARIANT[sale.sale_status]}>{STATUS_LABEL[sale.sale_status]}</Badge></TableCell>
                    <TableCell className="text-right line-through text-muted-foreground">{sale.price_formatted}</TableCell>
                    <TableCell className="text-right font-bold text-[#001a4d]">{sale.sale_price_formatted}</TableCell>
                    <TableCell className="text-right"><Badge variant="destructive">{sale.sale_percent}% off</Badge></TableCell>
                    <TableCell>
                      {sale.sale_status === 'expired'
                        ? 'Ended'
                        : remaining !== null && remaining >= 0
                          ? `${remaining} day${remaining === 1 ? '' : 's'} left`
                          : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {sale.sale_status !== 'expired' && (
                        <Button variant="outline" size="sm" className="gap-1 text-red-500" onClick={() => handleEndSale(sale.variant_id)}>
                          <X size={14} /> End now
                        </Button>
                      )}
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

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { adminApi } from '@/admin/lib/adminApi';
import { formatCurrency } from '@/api/EcommerceApi';

const MYR_INFO = { code: 'MYR', symbol: 'RM', template: 'RM$1', decimal_digits: 2 };

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = () => adminApi.get(`/orders/${id}`).then((data) => setOrder(data.order)).finally(() => setLoading(false));

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = async (status) => {
    setUpdating(true);
    const { order: updated } = await adminApi.patch(`/orders/${id}/status`, { status });
    setOrder(updated);
    setUpdating(false);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#001a4d]" /></div>;
  }

  if (!order) return <p>Order not found.</p>;

  return (
    <div className="space-y-6">
      <button type="button" onClick={() => navigate('/admin/orders')} className="flex items-center gap-2 text-sm font-semibold text-[#001a4d] hover:underline">
        <ArrowLeft size={16} /> Back to orders
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#001a4d]">{order.orderNumber}</h1>
          <p className="text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="capitalize">{order.status}</Badge>
          <Select value={order.status} onValueChange={handleStatusChange} disabled={updating}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Update status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Items</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-semibold text-[#001a4d]">{item.titleSnapshot}</p>
                      {item.variantTitleSnapshot && item.variantTitleSnapshot !== 'Default Variant' && (
                        <p className="text-xs text-muted-foreground">{item.variantTitleSnapshot}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unitPriceInCents, MYR_INFO)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.lineTotalInCents, MYR_INFO)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-end">
              <div className="w-48 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(order.subtotalInCents, MYR_INFO)}</span></div>
                <div className="flex justify-between font-bold text-[#001a4d]"><span>Total</span><span>{formatCurrency(order.totalInCents, MYR_INFO)}</span></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Customer</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-semibold text-[#001a4d]">{order.customer?.name || 'Guest'}</p>
            <p className="text-muted-foreground">{order.customerEmail}</p>
            {order.customer && (
              <Link to={`/admin/customers/${order.customer.id}`} className="inline-block text-sm font-semibold text-[#001a4d] hover:underline">
                View customer history →
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
